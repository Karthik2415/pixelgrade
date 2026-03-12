const { getDb } = require("../config/firebase");
const { runPuppeteerEvaluation } = require("../evaluationEngine/puppeteerRunner");
const { compareImages } = require("../visualEngine/imageCompare");
const { calculateScore } = require("../visualEngine/scoreCalculator");
const path = require("path");
const fs = require("fs");

/**
 * POST /evaluate/:submissionId
 * Orchestrates the full evaluation pipeline:
 *   1. Fetch submission + question data
 *   2. Run Puppeteer (DOM tests, interaction tests, screenshot)
 *   3. Visual comparison with reference image
 *   4. Calculate scores
 *   5. Store result in Firestore
 */
async function evaluateSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const db = getDb();

    // ── 1. Fetch submission ────────────────────────────────────────
    const submissionDoc = await db
      .collection("submissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const submission = submissionDoc.data();

    // ── 2. Fetch question ──────────────────────────────────────────
    const questionDoc = await db
      .collection("questions")
      .doc(submission.questionId)
      .get();

    if (!questionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Associated question not found",
      });
    }

    const question = questionDoc.data();

    // ── Update submission status ───────────────────────────────────
    await db.collection("submissions").doc(submissionId).update({
      status: "evaluating",
    });

    console.log(`🔍 Starting evaluation for submission: ${submissionId}`);

    // ── 3. Create screenshots directory ────────────────────────────
    const screenshotsDir = path.join(__dirname, "..", "screenshots", submissionId);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // ── 4. Run Puppeteer evaluation ────────────────────────────────
    let puppeteerResult;
    try {
      puppeteerResult = await runPuppeteerEvaluation({
        htmlCode: submission.htmlCode,
        cssCode: submission.cssCode,
        jsCode: submission.jsCode,
        testCases: question.testCases || { domTests: [], interactionTests: [] },
        screenshotPath: path.join(screenshotsDir, "actual.png"),
      });
      console.log(`📸 Screenshot captured, DOM tests run`);
    } catch (puppetErr) {
      console.error("Puppeteer evaluation failed:", puppetErr.message);
      
      // Update submission status to failed
      await db.collection("submissions").doc(submissionId).update({
        status: "failed",
        error: puppetErr.message || "Puppeteer evaluation failed",
      });
      
      return res.status(500).json({
        success: false,
        message: "Evaluation failed to run tests",
        error: puppetErr.message,
      });
    }

    // ── 5. Visual comparison ───────────────────────────────────────
    let visualResult = { mismatchPercentage: 100, diffImagePath: null };

    if (question.referenceImage) {
      try {
        // Decode base64 reference image and save
        const expectedPath = path.join(screenshotsDir, "expected.png");
        
        // Strip data URI prefix in case it's still there
        const base64Data = question.referenceImage.replace(/^data:image\/[a-z]+;base64,/, "");
        const refBuffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(expectedPath, refBuffer);

        const diffPath = path.join(screenshotsDir, "diff.png");

        visualResult = await compareImages(
          expectedPath,
          puppeteerResult.screenshotPath,
          diffPath
        );

        console.log(
          `🖼️  Visual comparison: ${visualResult.mismatchPercentage.toFixed(2)}% mismatch`
        );
      } catch (visualError) {
        console.error("Visual comparison skipped/failed (likely invalid PNG reference image):", visualError.message);
        visualResult = { mismatchPercentage: 100, diffImagePath: null };
      }
    }

    // ── 6. Calculate scores ────────────────────────────────────────
    const scores = calculateScore({
      domTestResults: puppeteerResult.domTestResults,
      interactionTestResults: puppeteerResult.interactionTestResults,
      mismatchPercentage: visualResult.mismatchPercentage,
    });

    console.log(`📊 Scores: DOM=${scores.domScore}, Interaction=${scores.interactionScore}, Visual=${scores.visualScore}, Total=${scores.totalScore}`);

    // ── 7. Build screenshot URLs ───────────────────────────────────
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const screenshots = {
      actualImage: `${baseUrl}/screenshots/${submissionId}/actual.png`,
      expectedImage: question.referenceImage 
        ? (question.referenceImage.startsWith('data:') ? question.referenceImage : `data:image/png;base64,${question.referenceImage}`)
        : null,
      diffImage: visualResult.diffImagePath
        ? `${baseUrl}/screenshots/${submissionId}/diff.png`
        : null,
    };

    // ── 8. Store result in Firestore ───────────────────────────────
    const evaluationResult = {
      submissionId,
      questionId: submission.questionId,
      studentId: submission.studentId,
      domScore: scores.domScore,
      interactionScore: scores.interactionScore,
      visualScore: scores.visualScore,
      totalScore: scores.totalScore,
      breakdown: scores.breakdown,
      domTestResults: puppeteerResult.domTestResults,
      interactionTestResults: puppeteerResult.interactionTestResults,
      mismatchPercentage: visualResult.mismatchPercentage,
      screenshots,
      failedTests: [
        ...puppeteerResult.domTestResults.filter((t) => !t.passed),
        ...puppeteerResult.interactionTestResults.filter((t) => !t.passed),
      ],
      evaluatedAt: new Date().toISOString(),
    };

    await db.collection("evaluationResults").add(evaluationResult);

    // ── Update submission status ───────────────────────────────────
    await db.collection("submissions").doc(submissionId).update({
      status: "evaluated",
      totalScore: scores.totalScore,
    });

    console.log(`✅ Evaluation complete for submission: ${submissionId}`);

    // ── 9. Return result ───────────────────────────────────────────
    res.json({
      success: true,
      message: "Evaluation completed",
      data: {
        totalScore: scores.totalScore,
        domScore: scores.domScore,
        interactionScore: scores.interactionScore,
        visualScore: scores.visualScore,
        expectedImage: screenshots.expectedImage,
        actualImage: screenshots.actualImage,
        diffImage: screenshots.diffImage,
        domTestResults: puppeteerResult.domTestResults,
        interactionTestResults: puppeteerResult.interactionTestResults,
        mismatchPercentage: visualResult.mismatchPercentage,
        failedTests: evaluationResult.failedTests,
      },
    });
  } catch (error) {
    console.error("Evaluation error:", error);

    // Update status to failed
    try {
      const db = getDb();
      await db.collection("submissions").doc(req.params.submissionId).update({
        status: "failed",
        error: error.message,
      });
    } catch (updateErr) {
      console.error("Failed to update submission status:", updateErr);
    }

    res.status(500).json({
      success: false,
      message: "Evaluation failed",
      error: error.message,
    });
  }
}

module.exports = { evaluateSubmission };

const { getDb } = require("../config/firebase");

/**
 * POST /submissions
 * Student submits HTML/CSS/JS code for a question
 */
async function createSubmission(req, res) {
  try {
    const { questionId, htmlCode, cssCode, jsCode, contestId } = req.body;
    console.log("📥 Received submission:", { questionId, contestId, htmlLen: htmlCode?.length, cssLen: cssCode?.length, jsLen: jsCode?.length });

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required",
      });
    }

    const db = getDb();

    // ── Verify question exists ─────────────────────────────────────
    const questionDoc = await db.collection("questions").doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const questionData = questionDoc.data();
    
    // ── Save submission ────────────────────────────────────────────
    const submissionData = {
      questionId,
      roomId: questionData.roomId || null,
      contestId: contestId || null,
      studentId: req.user.userId,
      studentName: req.user.name,
      htmlCode: htmlCode || "",
      cssCode: cssCode || "",
      jsCode: jsCode || "",
      status: "submitted",
      createdAt: new Date().toISOString(),
    };

    const submissionRef = await db.collection("submissions").add(submissionData);

    res.status(201).json({
      success: true,
      message: "Submission saved successfully",
      data: {
        submissionId: submissionRef.id,
        ...submissionData,
      },
    });
  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create submission",
      error: error.message,
    });
  }
}

/**
 * GET /submissions
 * Get submissions — students see their own, trainers see all
 */
async function getSubmissions(req, res) {
  try {
    const db = getDb();
    let query = db.collection("submissions");

    // Students only see their own submissions
    if (req.user.role === "student") {
      query = query.where("studentId", "==", req.user.userId);
    }

    const snapshot = await query.get();
    let submissions = snapshot.docs.map((doc) => ({
      submissionId: doc.id,
      ...doc.data(),
    }));

    // Apply optional filters in-memory to avoid needing composite indexes
    if (req.query.questionId) {
      submissions = submissions.filter(s => s.questionId === req.query.questionId);
    }
    if (req.query.roomId) {
      submissions = submissions.filter(s => s.roomId === req.query.roomId);
    }

    // Sort by newest first
    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
}

/**
 * GET /submissions/:id/result
 * Get Evaluation Result for a submission
 */
async function getSubmissionResult(req, res) {
  try {
    const db = getDb();
    const submissionId = req.params.id;

    // ── Get submission ─────────────────────────────────────────────
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

    // ── Get evaluation result ──────────────────────────────────────
    const resultSnapshot = await db
      .collection("evaluationResults")
      .where("submissionId", "==", submissionId)
      .limit(1)
      .get();

    if (resultSnapshot.empty) {
      return res.json({
        success: true,
        message: "Evaluation not yet completed",
        data: {
          submission: { submissionId, ...submissionDoc.data() },
          result: null,
        },
      });
    }

    const resultDoc = resultSnapshot.docs[0];

    res.json({
      success: true,
      data: {
        submission: { submissionId, ...submissionDoc.data() },
        result: { resultId: resultDoc.id, ...resultDoc.data() },
      },
    });
  } catch (error) {
    console.error("Get submission result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch result",
      error: error.message,
    });
  }
}

module.exports = { createSubmission, getSubmissions, getSubmissionResult };

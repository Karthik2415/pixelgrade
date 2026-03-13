const { getDb } = require("../config/firebase");

/**
 * POST /questions
 * Trainer creates a new question
 * Body: { title, description, referenceImage (base64), testCases, starterHtml, starterCss, starterJs, solutionHtml, solutionCss, solutionJs }
 */
async function createQuestion(req, res) {
  try {
    const {
      title,
      description,
      referenceImage,
      testCases,
      starterHtml,
      starterCss,
      starterJs,
      solutionHtml,
      solutionCss,
      solutionJs,
      roomId,
    } = req.body;

    if (!title || !description || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and roomId are required",
      });
    }

    const db = getDb();

    // ── Parse testCases if it's a string ───────────────────────────
    let parsedTestCases = testCases;
    if (typeof testCases === "string") {
      try {
        parsedTestCases = JSON.parse(testCases);
      } catch {
        return res.status(400).json({
          success: false,
          message: "testCases must be valid JSON",
        });
      }
    }

    const questionData = {
      title,
      description,
      referenceImage: referenceImage || null,
      testCases: parsedTestCases || { domTests: [], interactionTests: [] },
      starterHtml: starterHtml || "",
      starterCss: starterCss || "",
      starterJs: starterJs || "",
      solutionHtml: solutionHtml || "",
      solutionCss: solutionCss || "",
      solutionJs: solutionJs || "",
      roomId,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const questionRef = await db.collection("questions").add(questionData);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: {
        questionId: questionRef.id,
        ...questionData,
      },
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
}

/**
 * GET /questions
 * Get all questions
 */
async function getQuestions(req, res) {
  try {
    const { roomId } = req.query;
    const db = getDb();
    
    let query = db.collection("questions");
    if (roomId) {
      query = query.where("roomId", "==", roomId);
    }
    
    const snapshot = await query.get();
    
    const questions = snapshot.docs.map((doc) => ({
      questionId: doc.id,
      ...doc.data(),
    }));
    
    // Sort by newest first (in-memory to avoid needing a Firestore composite index)
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let finalQuestions = questions;
    
    // If student, attach submission status
    if (req.user && req.user.role === "student" && roomId) {
      const submissionsSnapshot = await db.collection("submissions")
        .where("roomId", "==", roomId)
        .where("studentId", "==", req.user.userId)
        .get();
        
      const userSubmissions = submissionsSnapshot.docs.map(doc => doc.data());
      
      finalQuestions = questions.map(q => {
        // Find latest submission for this question
        const qSubmissions = userSubmissions
          .filter(s => s.questionId === q.questionId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
        if (qSubmissions.length > 0) {
          return {
            ...q,
            latestSubmissionStatus: qSubmissions[0].status,
            latestScore: qSubmissions[0].score || null
          };
        }
        return q;
      });
    }

    res.json({
      success: true,
      data: finalQuestions,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
}

/**
 * GET /questions/:id
 * Get a single question by ID
 */
async function getQuestionById(req, res) {
  try {
    const db = getDb();
    const doc = await db.collection("questions").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      data: {
        questionId: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
      error: error.message,
    });
  }
}

/**
 * PUT /questions/:id
 * Update a question (trainer only)
 */
async function updateQuestion(req, res) {
  try {
    const db = getDb();
    const docRef = db.collection("questions").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };

    // Parse testCases if string
    if (typeof updates.testCases === "string") {
      updates.testCases = JSON.parse(updates.testCases);
    }

    await docRef.update(updates);

    res.json({
      success: true,
      message: "Question updated successfully",
      data: { questionId: req.params.id, ...updates },
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
}

/**
 * DELETE /questions/:id
 * Delete a question (trainer only)
 */
async function deleteQuestion(req, res) {
  try {
    const db = getDb();
    const docRef = db.collection("questions").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

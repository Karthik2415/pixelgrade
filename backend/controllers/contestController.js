const { getDb } = require("../config/firebase");

/**
 * Helper to determine contest status
 * upcoming, active, past
 */
function getContestStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  return "past";
}

/**
 * POST /contests
 * Creates a new contest (Trainers only)
 */
async function createContest(req, res) {
  try {
    const { title, description, startTime, endTime, questions } = req.body;

    if (!title || !startTime || !endTime || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (title, startTime, endTime, questions array)",
      });
    }

    const db = getDb();

    const contestData = {
      title,
      description: description || "",
      startTime,
      endTime,
      trainerId: req.user.userId,
      trainerName: req.user.name,
      questions, // Array of question objects containing title, description, testCases, etc.
      createdAt: new Date().toISOString(),
    };

    const contestRef = await db.collection("contests").add(contestData);

    res.status(201).json({
      success: true,
      message: "Contest created successfully",
      data: {
        contestId: contestRef.id,
        ...contestData,
        status: getContestStatus(startTime, endTime),
      },
    });
  } catch (error) {
    console.error("Create contest error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create contest",
      error: error.message,
    });
  }
}

/**
 * GET /contests
 * Get all contests. Can filter by status if needed, but normally frontend maps them.
 */
async function getContests(req, res) {
  try {
    const db = getDb();
    const snapshot = await db.collection("contests").get();

    const contests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        contestId: doc.id,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        trainerName: data.trainerName,
        questionCount: data.questions?.length || 0,
        status: getContestStatus(data.startTime, data.endTime),
      };
    });

    // Sort by start time descending
    contests.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    res.json({
      success: true,
      data: contests,
    });
  } catch (error) {
    console.error("Get contests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contests",
      error: error.message,
    });
  }
}

/**
 * GET /contests/:id
 * Get contest details. Hides questions if contest is 'upcoming' and user is student.
 */
async function getContest(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const doc = await db.collection("contests").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    const data = doc.data();
    const status = getContestStatus(data.startTime, data.endTime);
    const isStudent = req.user.role === "student";

    const responseData = {
      contestId: doc.id,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      status,
    };

    // Only show questions if the contest has started (active or past), OR if the user is a trainer
    if (!isStudent || status !== "upcoming") {
      // Clean up questions to have an ID if they were embedded
      responseData.questions = data.questions.map((q, idx) => ({
        ...q,
        // Fake an ID if embedded, or use real if referenced. 
        // For embedded, we use index as the ID string.
        questionId: q.questionId || `${id}_q${idx}`, 
      }));
    } else {
      responseData.questionCount = data.questions?.length || 0;
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get contest error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contest",
      error: error.message,
    });
  }
}

/**
 * GET /contests/:id/leaderboard
 * Fetch leaderboard for a specific contest
 */
async function getContestLeaderboard(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    // Fetch all submissions for this contest
    const snapshot = await db
      .collection("submissions")
      .where("contestId", "==", id)
      .get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    // Aggregate submissions by student
    const studentMap = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const { studentId, studentName, questionId, totalScore } = data;

      if (!studentId || !questionId) return;

      const score = totalScore || 0;

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId,
          name: studentName || "Unknown",
          email: "",
          bestScores: {},
          attempted: new Set(),
        };
      }

      studentMap[studentId].attempted.add(questionId);

      const current = studentMap[studentId].bestScores[questionId] || 0;
      if (score > current) {
        studentMap[studentId].bestScores[questionId] = score;
      }
    });

    // We skip email fetching for brevity/speed unless highly requested, 
    // or just fetch from users like in main leaderboard.
    // For contests, just name and score is usually enough.

    const leaderboard = Object.values(studentMap).map((student) => {
      const scores = Object.values(student.bestScores);
      const totalScore = scores.reduce((sum, s) => sum + s, 0);
      const questionsAttempted = student.attempted.size;
      const averageScore =
        questionsAttempted > 0
          ? Math.round((totalScore / questionsAttempted) * 100) / 100
          : 0;

      return {
        studentId: student.studentId,
        name: student.name,
        averageScore,
        questionsAttempted,
      };
    });

    // Sort by percentage descending
    leaderboard.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.questionsAttempted - a.questionsAttempted;
    });

    res.json({
      success: true,
      data: leaderboard,
    });

  } catch (error) {
    console.error("Contest leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contest leaderboard",
      error: error.message,
    });
  }
}

/**
 * GET /contests/:id/questions/:questionId
 * Fetch a specific embedded question from a contest for the workspace
 */
async function getContestQuestion(req, res) {
  try {
    const { id, questionId } = req.params;
    const db = getDb();

    const doc = await db.collection("contests").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    const data = doc.data();
    const status = getContestStatus(data.startTime, data.endTime);
    const isStudent = req.user.role === "student";

    if (isStudent && status === "upcoming") {
      return res.status(403).json({ success: false, message: "Contest has not started yet" });
    }

    // Find the embedded question by index (since ID is fake formatted as `${id}_q${idx}`)
    const qIndex = parseInt(questionId.split('_q')[1], 10);
    const question = data.questions[qIndex];

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found in contest" });
    }

    res.json({
      success: true,
      data: {
        questionId,
        contestId: id,
        ...question,
        // Override timeLimit with contest end time instead of individual question timeLimit
        contestEndTime: data.endTime 
      }
    });

  } catch (error) {
    console.error("Get contest question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contest question",
      error: error.message,
    });
  }
}

module.exports = {
  createContest,
  getContests,
  getContest,
  getContestLeaderboard,
  getContestQuestion
};

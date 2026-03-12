const { getDb } = require("../config/firebase");

/**
 * GET /leaderboard
 * Returns aggregated student scores from submissions.
 * Each student gets:
 *   - totalScore (sum of best scores per question)
 *   - questionsAttempted (number of unique questions attempted)
 *   - averageScore (totalScore / questionsAttempted)
 */
async function getLeaderboard(req, res) {
  try {
    const db = getDb();
    const { roomId } = req.query;

    // Fetch all submissions
    let query = db.collection("submissions");
    if (roomId) {
      query = query.where("roomId", "==", roomId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Aggregate: for each student, find the best score per question
    const studentMap = {}; // { studentId: { name, bestScores: { qId: score } } }

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const { studentId, studentName, questionId, totalScore } = data;

      if (!studentId || !questionId) return;

      // Use the totalScore from submission (set after evaluation), default to 0
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

      // Track all attempted questions
      studentMap[studentId].attempted.add(questionId);

      // Keep only the best score per question
      const current = studentMap[studentId].bestScores[questionId] || 0;
      if (score > current) {
        studentMap[studentId].bestScores[questionId] = score;
      }
    });

    // Fetch student emails from users collection
    const studentIds = Object.keys(studentMap);
    if (studentIds.length > 0) {
      const chunks = [];
      for (let i = 0; i < studentIds.length; i += 30) {
        chunks.push(studentIds.slice(i, i + 30));
      }

      for (const chunk of chunks) {
        const userDocs = await Promise.all(
          chunk.map((id) => db.collection("users").doc(id).get())
        );
        userDocs.forEach((doc) => {
          if (doc.exists && studentMap[doc.id]) {
            const userData = doc.data();
            studentMap[doc.id].name = userData.name || studentMap[doc.id].name;
            studentMap[doc.id].email = userData.email || "";
          }
        });
      }
    }

    // Build leaderboard array
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
        name: student.name || "Unknown",
        email: student.email || "",
        totalScore: Math.round(totalScore * 100) / 100,
        questionsAttempted,
        averageScore,
      };
    });

    // Sort by averageScore (percentage) descending, then by questions attempted descending
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
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
}

module.exports = { getLeaderboard };

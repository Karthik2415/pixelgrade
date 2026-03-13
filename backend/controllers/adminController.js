const { getDb } = require("../config/firebase");

/**
 * GET /admin/stats
 * Dashboard overview statistics
 */
async function getDashboardStats(req, res) {
  try {
    const db = getDb();

    const [usersSnap, roomsSnap, contestsSnap, submissionsSnap, evalsSnap] =
      await Promise.all([
        db.collection("users").get(),
        db.collection("rooms").get(),
        db.collection("contests").get(),
        db.collection("submissions").get(),
        db.collection("evaluationResults").get(),
      ]);

    // Role breakdown
    const users = usersSnap.docs.map((d) => d.data());
    const students = users.filter((u) => u.role === "student").length;
    const trainers = users.filter((u) => u.role === "trainer").length;
    const admins = users.filter((u) => u.role === "admin").length;

    // Evaluation score stats
    const scores = evalsSnap.docs
      .map((d) => d.data().totalScore)
      .filter((s) => typeof s === "number");
    const avgScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : 0;

    // Recent submissions (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentSubmissions = submissionsSnap.docs.filter(
      (d) => d.data().createdAt > weekAgo
    ).length;

    res.json({
      success: true,
      data: {
        totalUsers: usersSnap.size,
        students,
        trainers,
        admins,
        totalRooms: roomsSnap.size,
        totalContests: contestsSnap.size,
        totalSubmissions: submissionsSnap.size,
        totalEvaluations: evalsSnap.size,
        recentSubmissions,
        avgScore,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}

/**
 * GET /admin/users
 * List all users
 */
async function getAllUsers(req, res) {
  try {
    const db = getDb();
    const snapshot = await db.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
      password: undefined, // Never send passwords
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
}

/**
 * PUT /admin/users/:id/role
 * Update a user's role
 */
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["student", "trainer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'student', 'trainer', or 'admin'",
      });
    }

    const db = getDb();
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await userRef.update({ role });

    res.json({
      success: true,
      message: `User role updated to '${role}'`,
      data: { userId: id, role },
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
}

/**
 * DELETE /admin/users/:id
 * Delete a user
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await userRef.delete();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
}

/**
 * GET /admin/evaluations
 * List evaluation logs with submission details
 */
async function getEvaluationLogs(req, res) {
  try {
    const db = getDb();
    const evalsSnap = await db
      .collection("evaluationResults")
      .orderBy("evaluatedAt", "desc")
      .limit(100)
      .get();

    const logs = [];
    for (const doc of evalsSnap.docs) {
      const evalData = doc.data();

      // Fetch submission details for student name
      let studentName = "Unknown";
      let questionId = evalData.questionId || "";
      try {
        if (evalData.submissionId) {
          const subDoc = await db
            .collection("submissions")
            .doc(evalData.submissionId)
            .get();
          if (subDoc.exists) {
            studentName = subDoc.data().studentName || "Unknown";
            questionId = subDoc.data().questionId || questionId;
          }
        }
      } catch (_) {}

      logs.push({
        evaluationId: doc.id,
        submissionId: evalData.submissionId,
        questionId,
        studentName,
        domScore: evalData.domScore || 0,
        interactionScore: evalData.interactionScore || 0,
        visualScore: evalData.visualScore || 0,
        totalScore: evalData.totalScore || 0,
        evaluatedAt: evalData.evaluatedAt || "",
        status: evalData.status || "completed",
      });
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Evaluation logs error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch evaluation logs" });
  }
}

/**
 * GET /admin/policies
 * Get system policies
 */
async function getSystemPolicies(req, res) {
  try {
    const db = getDb();
    const policyDoc = await db.collection("system").doc("policies").get();

    const defaultPolicies = {
      maxSubmissionsPerStudent: 10,
      evaluationTimeoutSeconds: 60,
      maxContestsActive: 5,
      maxQuestionsPerRoom: 50,
      allowGoogleAuth: true,
      maintenanceMode: false,
    };

    const policies = policyDoc.exists
      ? { ...defaultPolicies, ...policyDoc.data() }
      : defaultPolicies;

    res.json({ success: true, data: policies });
  } catch (error) {
    console.error("Get policies error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch policies" });
  }
}

/**
 * PUT /admin/policies
 * Update system policies
 */
async function updateSystemPolicies(req, res) {
  try {
    const db = getDb();
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No policy updates provided",
      });
    }

    await db
      .collection("system")
      .doc("policies")
      .set(
        { ...updates, updatedAt: new Date().toISOString(), updatedBy: req.user.email },
        { merge: true }
      );

    res.json({ success: true, message: "Policies updated successfully" });
  } catch (error) {
    console.error("Update policies error:", error);
    res.status(500).json({ success: false, message: "Failed to update policies" });
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getEvaluationLogs,
  getSystemPolicies,
  updateSystemPolicies,
};

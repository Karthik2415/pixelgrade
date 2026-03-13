const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getEvaluationLogs,
  getSystemPolicies,
  updateSystemPolicies,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(requireRole("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/evaluations", getEvaluationLogs);
router.get("/policies", getSystemPolicies);
router.put("/policies", updateSystemPolicies);

module.exports = router;

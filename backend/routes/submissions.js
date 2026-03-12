const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmissionResult,
} = require("../controllers/submissionController");
const { authMiddleware } = require("../middleware/auth");

// POST /submissions — students submit code
router.post("/", authMiddleware, createSubmission);

// GET /submissions — list submissions (role-filtered)
router.get("/", authMiddleware, getSubmissions);

// GET /submissions/:id/result — get evaluation result
router.get("/:id/result", authMiddleware, getSubmissionResult);

module.exports = router;

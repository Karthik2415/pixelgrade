const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  createContest,
  getContests,
  getContest,
  getContestLeaderboard,
  getContestQuestion
} = require("../controllers/contestController");

// Get all contests
router.get("/", authMiddleware, getContests);

// Create a new contest (Trainers only)
router.post("/", authMiddleware, requireRole("trainer"), createContest);

// Get a specific contest
router.get("/:id", authMiddleware, getContest);

// Get a specific question within a contest
router.get("/:id/questions/:questionId", authMiddleware, getContestQuestion);

// Get the leaderboard for a specific contest
router.get("/:id/leaderboard", authMiddleware, getContestLeaderboard);

module.exports = router;

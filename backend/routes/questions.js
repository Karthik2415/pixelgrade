const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /questions — all authenticated users
router.get("/", authMiddleware, getQuestions);

// GET /questions/:id — all authenticated users
router.get("/:id", authMiddleware, getQuestionById);

// POST /questions — trainers only
router.post("/", authMiddleware, requireRole("trainer"), createQuestion);

// PUT /questions/:id — trainers only
router.put("/:id", authMiddleware, requireRole("trainer"), updateQuestion);

// DELETE /questions/:id — trainers only
router.delete("/:id", authMiddleware, requireRole("trainer"), deleteQuestion);

module.exports = router;

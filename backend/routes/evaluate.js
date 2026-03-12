const express = require("express");
const router = express.Router();
const { evaluateSubmission } = require("../controllers/evaluateController");
const { authMiddleware, requireRole } = require("../middleware/auth");

// POST /evaluate/:submissionId — trigger evaluation (trainers or system)
router.post("/:submissionId", authMiddleware, evaluateSubmission);

module.exports = router;

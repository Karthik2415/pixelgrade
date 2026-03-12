const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authMiddleware, requireRole } = require("../middleware/auth");

// Get all rooms (Trainer's owned rooms OR Student's joined rooms based on token)
router.get("/", authMiddleware, roomController.getRooms);

// Get specific room details
router.get("/:id", authMiddleware, roomController.getRoomById);

// Trainer creates a room
router.post("/", authMiddleware, requireRole("trainer"), roomController.createRoom);

// Student joins a room using code
router.post("/join", authMiddleware, requireRole("student"), roomController.joinRoom);

module.exports = router;

const express = require("express");
const router = express.Router();
const { register, login, googleAuth } = require("../controllers/authController");

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/google
router.post("/google", googleAuth);

module.exports = router;

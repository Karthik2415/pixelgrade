require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { initializeFirebase } = require("./config/firebase");

// ── Initialize Firebase ──────────────────────────────────────────────
initializeFirebase();

// ── Express App ──────────────────────────────────────────────────────
const app = express();

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST') console.log(req.body);
  next();
});

// Serve static screenshots
const screenshotsDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
app.use("/screenshots", express.static(screenshotsDir));

// ── Routes ───────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const submissionRoutes = require("./routes/submissions");
const evaluateRoutes = require("./routes/evaluate");
const roomRoutes = require("./routes/rooms");

app.use("/auth", authRoutes);
app.use("/questions", questionRoutes);
app.use("/submissions", submissionRoutes);
app.use("/evaluate", evaluateRoutes);
app.use("/rooms", roomRoutes);

// ── Health Check ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "PixelGrade API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ── Start Server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PixelGrade API running on http://localhost:${PORT}`);
});

module.exports = app;

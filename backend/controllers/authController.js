const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/firebase");
require("dotenv").config();

/**
 * POST /auth/register
 * Register a new user (student or trainer)
 */
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // ── Validation ─────────────────────────────────────────────────
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, role",
      });
    }

    if (!["student", "trainer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'student', 'trainer', or 'admin'",
      });
    }

    const db = getDb();

    // ── Check if user already exists ───────────────────────────────
    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ── Hash password & create user ────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRef = await db.collection("users").add({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    });

    // ── Generate JWT ───────────────────────────────────────────────
    const token = jwt.sign(
      { userId: userRef.id, email, role, name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: userRef.id,
        name,
        email,
        role,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
}

/**
 * POST /auth/login
 * Authenticate user and return JWT
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const db = getDb();

    // ── Find user ──────────────────────────────────────────────────
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // ── Verify password ────────────────────────────────────────────
    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── Generate JWT ───────────────────────────────────────────────
    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        userId: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}

/**
 * POST /auth/google
 * Authenticate via Google (Firebase Auth)
 */
async function googleAuth(req, res) {
  try {
    const { email, name, uid, role } = req.body;

    if (!email || !uid) {
      return res.status(400).json({
        success: false,
        message: "Email and uid are required for Google Auth",
      });
    }

    const db = getDb();

    // Check if user already exists
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    let userDoc;
    let userData;

    if (usersSnapshot.empty) {
      // User doesn't exist. If no role is provided, this must have been a login attempt
      if (!role) {
         return res.status(404).json({
           success: false,
           message: "Account not found. Please register first.",
         });
      }

      if (!["student", "trainer", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be 'student', 'trainer', or 'admin'",
        });
      }

      // Create new user via Google Sign-in registration
      const userRef = await db.collection("users").add({
        name: name || "Google User",
        email,
        authProvider: "google",
        firebaseUid: uid,
        role,
        createdAt: new Date().toISOString(),
      });
      
      const newDoc = await userRef.get();
      userDoc = newDoc;
      userData = newDoc.data();
    } else {
      // User exists, log them in (ignore the role passed from frontend, use DB role)
      userDoc = usersSnapshot.docs[0];
      userData = userDoc.data();
      
      // Optionally link Google provider if they originally signed up via email/password
      if (!userData.authProvider) {
         await userDoc.ref.update({ authProvider: "google", firebaseUid: uid });
      }
    }

    // Generate custom backend JWT
    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Google Auth successful",
      data: {
        userId: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        token,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google Auth failed",
      error: error.message,
    });
  }
}

module.exports = { register, login, googleAuth };

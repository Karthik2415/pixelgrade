const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";

let db;

function initializeFirebase() {
  try {
    const serviceAccount = require(path.resolve(serviceAccountPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Firebase Firestore connected successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    console.error("   Make sure serviceAccountKey.json is in the backend/ directory.");
    console.error("   Download it from Firebase Console → Project Settings → Service Accounts");
    process.exit(1);
  }
}

function getDb() {
  if (!db) {
    throw new Error("Firestore not initialized. Call initializeFirebase() first.");
  }
  return db;
}

module.exports = { initializeFirebase, getDb, admin };

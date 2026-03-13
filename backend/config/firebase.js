const admin = require("firebase-admin");
require("dotenv").config();

try {
  // Check if a service account key file exists
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized via serviceAccountKey.json");
} catch (error) {
  // Fallback to environment variables if possible, 
  // or initialize with default if running in a Google Cloud environment
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log("Firebase Admin initialized via Project ID:", process.env.FIREBASE_PROJECT_ID);
  } else {
    console.warn("Firebase Admin NOT initialized. Please add serviceAccountKey.json to backend folder.");
  }
}

const db = admin.firestore();

module.exports = { admin, db };

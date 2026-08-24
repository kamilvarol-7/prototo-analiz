const admin = require('firebase-admin');

let db = null;

function getFirestoreDb() {
  if (db) return db;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Environment Variables are missing. App will fall back to local mock data.");
    return null;
  }

  // Replace escaped newline characters from Vercel dashboard environment inputs
  privateKey = privateKey.replace(/\\n/g, '\n');

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
    }
    db = admin.firestore();
    return db;
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    return null;
  }
}

module.exports = { getFirestoreDb };

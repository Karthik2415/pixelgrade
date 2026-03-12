const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function testEval() {
  try {
    // get latest submission
    const subs = await db.collection('submissions').orderBy('createdAt', 'desc').limit(1).get();
    const subId = subs.docs[0].id;
    console.log("Evaluating submission:", subId);
    
    // We don't have a token, but we can generate a custom token via Firebase Admin, then exchange it for an ID token
    // Actually, let's just create a quick temporary route in server.js to test evaluation without auth
  } catch (e) {
    console.log(e);
  }
}
testEval();

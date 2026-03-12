const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function check() {
  const evals = await db.collection('evaluationResults').orderBy('evaluatedAt', 'desc').limit(1).get();
  evals.forEach(doc => {
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}
check();

// access/firebase/firebaseAdminConfig.js
const admin = require('firebase-admin');

// Decode the base64-encoded service account key
const decodedServiceAccount = Buffer.from(process.env.ENCODED_FIREBASE_SERVICE_ACCOUNT, 'base64').toString('ascii');

// Parse the JSON string into an object
const serviceAccount = JSON.parse(decodedServiceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

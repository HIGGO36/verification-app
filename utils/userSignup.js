// utils/userSignup.js
const admin = require('firebase-admin');

// This function now explicitly requires a UID
const userSignup = async (userData, uid) => {
  const { userType } = userData;
  const collectionName = `${userType.toLowerCase()}s`;

  // Include UID in the document to create a direct link to Firebase Auth user
  const userDetailsWithUID = { ...userData, uid };

  await admin.firestore().collection(collectionName).doc(uid).set({
    ...userDetailsWithUID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Optional: Set custom claims if needed for user permissions
  await admin.auth().setCustomUserClaims(uid, { userType });

  return { userId: uid, userType };
};

module.exports = userSignup;

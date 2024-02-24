// firestoreService.js
const admin = require('firebase-admin');
const db = admin.firestore();

const addUserDocument = async (userType, userData, uid) => {
  const collectionName = `${userType.toLowerCase()}s`;
  try {
    await db.collection(collectionName).doc(uid).set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User document written in ${collectionName} with ID: ${uid}`);
  } catch (error) {
    console.error("Error adding user document:", error);
    throw error;
  }
};

const fetchUserProfileByUid = async (uid) => {
  try {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log('User data:', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such user!');
      return null;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

module.exports = { addUserDocument, fetchUserProfileByUid };

// access/firestore/firestoreService.js
const { db } = require('../firebase/firebaseAdminConfig');

/**
 * Add a user document to Firestore.
 * @param {string} userType - The type of the user (e.g., 'jobseeker', 'employer').
 * @param {Object} userData - The data to be saved for the user.
 * @param {string} uid - The UID of the user from Firebase Auth.
 */
// const addUserDocument = async (userType, userData, uid) => {
//   const collectionName = `${userType.toLowerCase()}s`;
//   try {
//     await db.collection(collectionName).doc(uid).set(userData);
//     console.log(`User document written in ${collectionName} with ID: `, uid);
//   } catch (error) {
//     console.error("Error adding user document: ", error);
//     throw error;
//   }
// };

const addUserDocument = async (userType, userData, uid) => {
  // Example adjustment for camelCase (assuming userType is 'Job Seeker', 'Employer', or 'Recruiter')
  const collectionName = userType.replace(/\s+/g, '').toLowerCase(); // 'jobseeker', 'employer', 'recruiter'

  try {
    await db.collection(collectionName).doc(uid).set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User document written in ${collectionName} with ID: `, uid);
  } catch (error) {
    console.error("Error adding user document: ", error);
    throw error;
  }
};

/**
 * Fetch a user profile by UID from Firestore.
 * @param {string} uid - The UID of the user.
 */
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

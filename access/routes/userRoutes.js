const express = require('express');
const router = express.Router();
const db = require('../firebase/firebaseAdminConfig').db;
const auth = require('../firebase/firebaseAdminConfig').auth; // Ensure correct import for auth
const verifyBusinessEmail = require('../../middleware/verifyBusinessEmail');
const ensureAuthenticated = require('../../middleware/ensureAuthenticated');

// Helper to update userType in a central record
const updateUserTypeRecord = async (uid, userType) => {
  await db.collection('users').doc(uid).set({ userType }, { merge: true });
};

// User Signup
router.post('/signup', verifyBusinessEmail, async (req, res) => {
  const { email, password, userType, businessEmail, ...otherDetails } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password });
    const uid = userRecord.uid;
    let userData = { ...otherDetails, email, userType };
    if (businessEmail) userData.businessEmail = businessEmail;

    // Set data in specific collection based on userType and in central 'users' collection
    await db.collection(userType.toLowerCase()).doc(uid).set(userData);
    await updateUserTypeRecord(uid, userType);

    res.json({ success: true, message: 'Signup successful', uid });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred during signup.' });
  }
});

// Token Verification
router.post('/verifyToken', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch userType from central 'users' collection
    const userTypeDoc = await db.collection('users').doc(uid).get();
    if (!userTypeDoc.exists) {
      return res.status(404).json({ success: false, message: 'User type not found' });
    }
    const { userType } = userTypeDoc.data();

    res.json({ success: true, uid, userType, message: 'Token verified successfully' });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(403).json({ success: false, message: 'Failed to verify ID token' });
  }
});

// Profile Endpoints (GET and PUT)
router.route('/profile')
  .get(ensureAuthenticated, async (req, res) => {
    const { uid } = req; // Assuming ensureAuthenticated sets req.uid

    // Dynamic collection name based on userType, extracted from 'users' collection
    const userRef = await db.collection('users').doc(uid).get();
    if (!userRef.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { userType } = userRef.data();
    const collectionName = userType.toLowerCase();

    const profileRef = await db.collection(collectionName).doc(uid).get();
    if (!profileRef.exists) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profileRef.data());
  })
  .put(ensureAuthenticated, async (req, res) => {
    const { uid } = req; // Assuming ensureAuthenticated sets req.uid
    const updatedData = req.body;

    const userRef = await db.collection('users').doc(uid).get();
    if (!userRef.exists) {
      return res.status(404).json({ message: 'User not found for update' });
    }
    const { userType } = userRef.data();
    const collectionName = userType.toLowerCase();

    await db.collection(collectionName).doc(uid).update(updatedData);
    res.json({ success: true, message: 'Profile updated successfully' });
  });

router.post('/signout', ensureAuthenticated, async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error signing out' });
        } else {
            res.clearCookie('connect.sid');
            res.json({ success: true, message: 'Sign-out successful' });
        }
    });
});

module.exports = router;

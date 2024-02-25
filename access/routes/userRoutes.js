const express = require('express');
const router = express.Router();
const db = require('../firebase/firebaseAdminConfig').db;
const { auth } = require('../firebase/firebaseAdminConfig');
const verifyBusinessEmail = require('../../middleware/verifyBusinessEmail');
const ensureAuthenticated = require('../../middleware/ensureAuthenticated');

// Create or update central record in users collection
const updateUserTypeRecord = async (uid, userType) => {
    await db.collection('users').doc(uid).set({ userType }, { merge: true });
};

router.post('/signup', verifyBusinessEmail, async (req, res) => {
    const { email, password, userType, businessEmail, ...otherDetails } = req.body;

    try {
        const userRecord = await auth.createUser({ email, password });
        const uid = userRecord.uid;

        let userData = { ...otherDetails, email };
        if (businessEmail) userData.businessEmail = businessEmail;

        await db.collection(userType.toLowerCase()).doc(uid).set(userData);
        await updateUserTypeRecord(uid, userType);

        res.json({ success: true, message: 'Signup successful', uid });
    } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = 'An unexpected error occurred during signup.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email already in use.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak.';
        }
        res.status(500).json({ success: false, message: errorMessage });
    }
});

router.post('/verifyToken', async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Proceed with fetching user type or other server-side logic
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

// Protected route that checks if a user is authenticated
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.json({ message: 'This is the dashboard.', userType: req.session.user.userType });
});

// SignOut Endpoint
router.post('/signout', async (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ success: false, message: 'Error signing out' });
            } else {
                res.clearCookie('connect.sid', { path: '/' });
                res.json({ success: true, message: 'Sign-out successful' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'No active session' });
    }
});

module.exports = router;

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

// Fetch user's profile data
// router.get('/profile', ensureAuthenticated, async (req, res) => {
//     const uid = req.uid; // Assume ensureAuthenticated middleware sets req.uid
//     try {
//         const userDoc = await db.collection('users').doc(uid).get();
//         if (!userDoc.exists) {
//             return res.status(404).send('User not found');
//         }
//         res.json(userDoc.data());
//     } catch (error) {
//         console.error('Fetch profile error:', error);
//         res.status(500).send('Internal server error');
//     }
// });

// // Update user's profile data
// router.put('/profile', ensureAuthenticated, async (req, res) => {
//     const uid = req.uid; // Ensure uid is set by the ensureAuthenticated middleware
//     const updatedData = req.body;
//     try {
//         await db.collection('users').doc(uid).update(updatedData);
//         res.send('Profile updated successfully');
//     } catch (error) {
//         console.error('Update profile error:', error);
//         res.status(500).send('Internal server error');
//     }
// });


// Combined GET and PUT endpoint for /profile
router.route('/profile')
    // .get(ensureAuthenticated, async (req, res) => {
    //     // Ensure `ensureAuthenticated` middleware correctly sets `req.uid`
    //     try {
    //         const userDoc = await db.collection('users').doc(req.uid).get();
    //         if (!userDoc.exists) {
    //             return res.status(404).json({ success: false, message: 'User not found' });
    //         }
    //         res.json({ success: true, userData: userDoc.data() });
    //     } catch (error) {
    //         console.error('Fetch profile error:', error);
    //         res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    //     }
  // })
  
  // Inside your GET /profile route
.get(ensureAuthenticated, async (req, res) => {
    const uid = req.uid;
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Fetched user data:", userDoc.data()); // Debug log
        res.json(userDoc.data());
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

    .put(ensureAuthenticated, async (req, res) => {
        const updatedData = req.body;
        try {
            await db.collection('users').doc(req.uid).update(updatedData);
            res.json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
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

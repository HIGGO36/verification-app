const express = require('express');
const router = express.Router();
const cors = require('cors');
const db = require('../firebase/firebaseAdminConfig').db; // Adjust this path as needed
const { auth } = require('../firebase/firebaseAdminConfig');
const verifyBusinessEmail = require('../../middleware/verifyBusinessEmail');
const ensureAuthenticated = require('../../middleware/ensureAuthenticated');

// Create or update central record in users collection
const updateUserTypeRecord = async (uid, userType) => {
    await db.collection('users').doc(uid).set({ userType }, { merge: true });
};

// SignUp Endpoint
// router.post('/signup', verifyBusinessEmail, async (req, res) => {
//     const { email, password, userType, businessEmail, ...otherDetails } = req.body;

//     try {
//         const userRecord = await auth.createUser({ email, password });
//         const uid = userRecord.uid;

//         let userData = { ...otherDetails, email };
//         if (businessEmail) userData.businessEmail = businessEmail;

//         await db.collection(`${userType.toLowerCase()}s`).doc(uid).set(userData);
//         await updateUserTypeRecord(uid, userType);

//         res.json({ success: true, message: 'Signup successful', uid });
//     } catch (error) {
//         console.error("Signup error:", error);
//         let errorMessage = 'An error occurred during signup.';
//         if (error.errorInfo && error.errorInfo.code === 'auth/email-already-in-use') {
//             errorMessage = 'Email already in use.';
//         }
//         res.status(500).json({ success: false, message: errorMessage });
//     }
// });

// router.post('/signup', verifyBusinessEmail, async (req, res) => {
//     const { email, password, userType, businessEmail, ...otherDetails } = req.body;

//     console.log("Signup request received:", { email, userType, businessEmail, otherDetails });

//     try {
//         const userRecord = await auth.createUser({ email, password });
//         const uid = userRecord.uid;

//         let userData = { ...otherDetails, email };
//         if (businessEmail) userData.businessEmail = businessEmail;

//         console.log("Creating user document for:", uid, userData);

//         await db.collection(`${userType.toLowerCase()}s`).doc(uid).set(userData);
//         await updateUserTypeRecord(uid, userType);

//         res.json({ success: true, message: 'Signup successful', uid });
//     } catch (error) {
//         console.error("Signup error:", error);
//         let errorMessage = 'An error occurred during signup.';
//         if (error.errorInfo && error.errorInfo.code === 'auth/email-already-in-use') {
//             errorMessage = 'Email already in use.';
//         }
//         res.status(500).json({ success: false, message: errorMessage });
//     }
// });

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

        // Firebase Auth specific errors
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email already in use.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak.';
        }

        res.status(500).json({ success: false, message: errorMessage });
    }
});


// SignIn Endpoint
router.post('/signin', async (req, res) => {
    const { email } = req.body;

    try {
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;

        const userTypeDoc = await db.collection('users').doc(uid).get();
        if (!userTypeDoc.exists) {
            return res.status(404).json({ success: false, message: 'User type not found' });
        }
        const { userType } = userTypeDoc.data();

        req.session.user = { uid, email, userType };
        res.json({ success: true, message: 'Sign-in successful', uid, userType });
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).json({ success: false, message: 'Sign-in failed', error: error.message });
    }
});

// Protected route that checks if a user is authenticated
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.json({
        message: 'This is the dashboard.',
        userType: req.session.user.userType
    });
});

// SignOut Endpoint
// router.post('/signout', (req, res) => {
//     if (req.session.user) {
//         req.session.destroy(err => {
//             if (err) {
//                 res.status(500).json({ success: false, message: 'Error signing out' });
//             } else {
//                 res.clearCookie('connect.sid'); // Ensure to clear the session cookie
//                 res.json({ success: true, message: 'Sign-out successful' });
//             }
//         });
//     } else {
//         res.status(400).json({ success: false, message: 'No active session' });
//     }
// });
// SignOut Endpoint with specific CORS options (if needed)
router.post('/signout', cors(), (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ success: false, message: 'Error signing out' });
            } else {
                // Ensure to clear the session cookie if you are using one
                res.clearCookie('connect.sid', { path: '/' }); // Adjust according to your session cookie settings
                res.json({ success: true, message: 'Sign-out successful' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'No active session' });
    }
});


module.exports = router;

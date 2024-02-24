// /middleware/handleUserSignup.js
const admin = require('firebase-admin');

const handleUserSignup = async (req, res) => {
    try {
        const { email, password, userType, ...otherDetails } = req.body;

        // Step 1: Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({ email, password });
        const uid = userRecord.uid;

        // Step 2: Add user profile to "user-profiles" collection
        await admin.firestore().collection('user-profiles').doc(uid).set({
            userType,
            uid,
            ...otherDetails,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Optional: Set custom claims for role-based access control
        await admin.auth().setCustomUserClaims(uid, { userType });

        // Respond with success message
        res.json({
            success: true,
            message: 'Signup successful',
            userId: uid,
            userType
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: 'Signup failed',
            error: error.message
        });
    }
};

module.exports = handleUserSignup;

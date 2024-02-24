// middleware/verifyFirebaseAuth.js
const { auth } = require('../access/firebase/firebaseAdminConfig');

const verifyTokenAndSetSession = async (req, res, next) => {
    if (req.session.user) {
        // User is already logged in, proceed
        return next();
    }

    const idToken = req.headers.authorization.split('Bearer ')[1]; // Adjusted to extract token correctly
    if (!idToken) {
        return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.session.user = { uid: decodedToken.uid, email: decodedToken.email }; // Store essential user info in session
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ success: false, message: 'Unauthorized access. Token verification failed.' });
    }
};

module.exports = verifyTokenAndSetSession;

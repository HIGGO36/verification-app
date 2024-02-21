require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const admin = require('firebase-admin');
const userSignup = require('./utils/userSignup');
const secureCookies = require('./middleware/secureCookies');
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
let serviceAccount = serviceAccountPath ? JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) : {};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const rateLimiting = require('./middleware/rateLimiting');
const { sanitizeRequestBody } = require('./middleware/sanitize');
const { validateSignUp, validateResult } = require('./middleware/validation');
const { verifyEmailDomain } = require('./middleware/emailVerification');
const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(rateLimiting);
app.use(sanitizeRequestBody);
app.set('trust proxy', 1); // Important for secureCookies to correctly determine if the request is secure
app.use(secureCookies); // Use secureCookies middleware

app.get('/', (req, res) => {
    res.send('Welcome to the Email Verification Service');
});

app.post('/signup', validateSignUp, validateResult, async (req, res) => {
    try {
        const userId = await userSignup(req.body);
        res.json({ success: true, message: 'Signup successful', userId });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: 'Signup failed',
            errors: error.message 
        });
    }
});

app.post('/verify-email', verifyEmailDomain);

// Remove the duplicate app.listen call
app.listen(port, () => console.log(`Server running on port ${port}`));

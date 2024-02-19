const express = require('express');
const cors = require('cors');
const rateLimiting = require('./middleware/rateLimiting');
const { sanitizeRequestBody } = require('./middleware/sanitize');
const { validateSignUp, validateResults } = require('./middleware/validation');
const { verifyEmailDomain } = require('./middleware/emailVerification');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(rateLimiting);
app.use(sanitizeRequestBody);

app.get('/', (req, res) => {
    res.send('Welcome to the Email Verification Service');
});

app.post('/signup', validateSignUp, validateResults, (req, res) => {

  res.json({ success: true, message: 'Signup successful' });
});

app.post('/verify-email', verifyEmailDomain);

app.listen(port, () => console.log(`Server running on port ${port}`));

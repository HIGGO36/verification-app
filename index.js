// Index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3001;
// Import middlewares
const secureCookies = require('./middleware/secureCookies');
const rateLimiting = require('./middleware/rateLimiting');
const sanitizeRequestBody = require('./middleware/sanitize');
// Make sure the path to 'userRoutes' is correct according to your project structure
const userRoutes = require('./access/routes/userRoutes'); 

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(secureCookies);
}
app.use(rateLimiting);
app.use(sanitizeRequestBody);

// Session configuration with secret for signing the session ID cookie
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-strong-secret-here', // It's better to have a fallback secret for development
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production environments
}));

app.get('/', (_, res) => res.send('Welcome to the Email Verification Service'));

app.use('/api/users', userRoutes);

// Global error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
});

app.listen(port, () => console.log(`Server running on port ${port}`));

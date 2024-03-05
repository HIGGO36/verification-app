// index.js
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
// Import routes
const userRoutes = require('./access/routes/userRoutes');
// Global CORS Options
const corsOptions = {
    origin: 'http://localhost:3000', // Adjust as needed for production or development
  credentials: true, 
};

// Apply Helmet for basic security
app.use(helmet());
// Apply CORS globally with options
app.use(cors(corsOptions));
// Support JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-strong-secret-here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }, // Secure cookies in production
}));

// Custom middlewares
if (process.env.NODE_ENV === 'production') {
  app.use(secureCookies);
}
app.use(rateLimiting);
app.use(sanitizeRequestBody);

// Routes
app.use('/api/users', userRoutes);

// Welcome route
app.get('/', (_, res) => res.send('Welcome to the Email Verification Service'));

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));

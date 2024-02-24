// middleware/expressSession.js
const session = require('express-session');

app.use(session({
  secret: process.env.EXPRESS_APP_FIREBASE_API_KEY, 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } 
}));

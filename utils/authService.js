// authService.js
const admin = require('firebase-admin');

const signOut = async (uid) => {
  // Firebase Admin SDK does not directly support sign-out.
  // Sign-out is typically a client-side operation.
  // Here, might handle server-side cleanup or revoke refresh tokens.
};

module.exports = { signOut };

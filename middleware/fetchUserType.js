// ./middleware/fetchUserType.js
const admin = require('firebase-admin');

const fetchUserType = async (req, res) => {
  const { uid } = req.params; // Ensure this matches the route parameter
  try {
    // Example: Fetching user type from Firestore (adjust according to your DB structure)
    const docRef = admin.firestore().collection('users').doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Assuming userType is stored directly on the user document
    res.json({ success: true, userType: doc.data().userType });
  } catch (error) {
    console.error(`Error fetching user type for UID ${uid}:`, error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user type' });
  }
};

module.exports = fetchUserType;


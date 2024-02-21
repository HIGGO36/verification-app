// Assuming this utility is called after Firebase Auth has created the user
const admin = require('firebase-admin');

const userSignup = async (userData) => {
    // Destructure to exclude password from userData if it exists
    const { password, ...userDetails } = userData;

    // Determine the collection name based on userType
    let collectionName = '';
    switch (userDetails.userType) {
        case 'Employer':
            collectionName = 'employers';
            break;
        case 'Recruiter':
            collectionName = 'recruiters';
            break;
        default:
            collectionName = 'jobseekers';
    }

    // Add user data to Firestore (excluding the password)
    const docRef = await admin.firestore().collection(collectionName).add({
        ...userDetails,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return docRef.id; // Return the document ID of the new user record
};

module.exports = userSignup;

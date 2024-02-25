// middleware/ensureAuthenticated.js
const admin = require('firebase-admin');

function ensureAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('No token provided or invalid token format.');
    }

    const token = authHeader.split('Bearer ')[1];
    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.uid = decodedToken.uid;
            next();
        })
        .catch(error => {
            res.status(403).send(`Token verification failed: ${error.message}`);
        });
}


module.exports = ensureAuthenticated;



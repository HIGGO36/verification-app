// middleware/ensureAuthenticated.js
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Access denied. Please log in.' });
    }
}
module.exports = ensureAuthenticated;

// middleware/secureCookies.js
function secureCookies(req, res, next) {
    if (req.secure) {
        res.setHeader('Set-Cookie', 'secure=1; SameSite=None; Secure');
        next();
    } else {
        res.redirect(`https://${req.headers.host}${req.url}`);
    }
}

module.exports = secureCookies;

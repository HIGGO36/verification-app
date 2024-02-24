// middleware/secureCookies.js

// function secureCookies(req, res, next) {
//     if (req.secure) {
//         // Set HttpOnly, Secure, and SameSite flags for cookies
//         res.setHeader('Set-Cookie', [
//             'secure=1; HttpOnly; Secure; SameSite=None',
          
//         ]);
//         next();
//     } else {
//         res.redirect(`https://${req.headers.host}${req.url}`);
//     }
// }

module.exports = secureCookies;


// middleware/secureCookies.js
function secureCookies(req, res, next) {
  if (req.secure) {
    next();
  } else if (process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
}

module.exports = secureCookies;

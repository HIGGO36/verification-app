// middleware/sanitize.js
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM('').window);

const sanitizeRequestBody = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = DOMPurify.sanitize(req.body[key]);
    }
  });
  next();
};

module.exports = sanitizeRequestBody;

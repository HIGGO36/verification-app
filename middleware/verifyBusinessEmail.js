// middleware/verifyBusinessEmail.js
const dns = require('dns');
const { promisify } = require('util');
const NodeCache = require('node-cache');
const dnsCache = new NodeCache({ stdTTL: 7200 });

const resolveMx = promisify(dns.resolveMx);
const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

const verifyBusinessEmail = async (req, res, next) => {
    // Only proceed if businessEmail is provided and userType requires it
    if (!req.body.businessEmail || ['JobSeeker'].includes(req.body.userType)) {
        return next(); // Skip this middleware for job seekers or if businessEmail is not provided
    }

    const email = req.body.businessEmail;
    const domain = email.split('@')[1];

    if (freeEmailProviders.includes(domain)) {
        return res.status(400).json({ success: false, message: 'Business email is required for Employer and Recruiter.' });
    }

    try {
        const addresses = await resolveMx(domain);
        if (addresses.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid business email domain.' });
        }
        next(); // Domain is valid
    } catch (error) {
        console.error("Error verifying business email:", error);
        res.status(500).json({ success: false, message: 'Error verifying business email.' });
    }
};


module.exports = verifyBusinessEmail;

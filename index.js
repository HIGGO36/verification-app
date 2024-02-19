const express = require('express');
const dns = require('dns');
const cors = require('cors');
const rateLimiting = require('./middleware/rateLimiting');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(rateLimiting); // Apply rate limiting to all routes

// List of common free email providers for preliminary check
const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

app.get('/', (req, res) => {
    res.send('Welcome to the Email Verification Service');
});

// Endpoint to verify if an email address is from a business domain
app.post('/verify-email', (req, res) => {
    const { email } = req.body;
    // Extract the domain part of the email address
    const domain = email.split('@')[1];

    // Check if the email domain is from a known free email provider
    if (freeEmailProviders.includes(domain)) {
        // Respond that it's not a business domain
        return res.json({ success: false, message: 'Email belongs to a free email provider, not a business domain' });
    }

    // If not a free email provider, proceed with DNS MX record lookup
    dns.resolveMx(domain, (err, addresses) => {
        if (err) {
            // Log and respond with error if DNS lookup fails
            console.error(err);
            return res.status(500).json({ success: false, message: 'DNS lookup failed' });
        }

        // Check if there are MX records indicating a valid domain
        if (addresses && addresses.length > 0) {
            // Respond positively for valid business email domains
            res.json({ success: true, message: 'Valid business email domain' });
        } else {
            // Respond negatively if no valid MX records found
            res.status(400).json({ success: false, message: 'Invalid business email domain' });
        }
    });
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));

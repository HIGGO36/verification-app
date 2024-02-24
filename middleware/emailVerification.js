const dns = require('dns');
const { promisify } = require('util');
const NodeCache = require('node-cache');
const dnsCache = new NodeCache({ stdTTL: 7200 }); // Cache for 2 hours
const resolveMx = promisify(dns.resolveMx);
const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

const verifyEmailDomain = async (req, res, next) => {
    const { email } = req.body;
    const domain = email.split('@')[1];

    if (freeEmailProviders.includes(domain)) {
        return res.json({ success: false, message: 'Email belongs to a free email provider, not a business domain' });
    }

    // Check cache first
    const cachedResult = dnsCache.get(domain);
    if (cachedResult !== undefined) {
        return res.json({ success: true, message: 'Valid business email domain (cached)' });
    }

    try {
        const addresses = await resolveMx(domain);
        if (addresses && addresses.length > 0) {
            // Cache positive lookup result
            dnsCache.set(domain, true);
            res.json({ success: true, message: 'Valid business email domain' });
        } else {
            res.status(404).json({ success: false, message: 'Invalid business email domain' });
        }
    } catch (err) {
        console.error(`DNS lookup error for domain ${domain}: ${err.message}`);
        switch (err.code) {
            case 'ENOTFOUND':
                res.status(404).json({ success: false, message: 'Domain not found' });
                break;
            case 'ETIMEOUT':
                res.status(408).json({ success: false, message: 'DNS lookup timed out' });
                break;
            case 'ENODATA':
            case 'ENOENT':
                res.status(404).json({ success: false, message: 'No DNS data found for domain' });
                break;
            default:
                res.status(500).json({ success: false, message: 'DNS lookup failed due to server error' });
                break;
        }
    }
};

module.exports = { verifyEmailDomain };

// utils/encode-service-account.js
require('dotenv').config(); // Load environment variables

const fs = require('fs');

// Using the environment variable for the file path
const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

// Read the JSON file
const serviceAccount = fs.readFileSync(filePath, 'utf8');

// Encode the JSON object as a base64 string
const encodedServiceAccount = Buffer.from(serviceAccount).toString('base64');

console.log('Encoded Firebase Service Account Key:');
console.log(encodedServiceAccount);

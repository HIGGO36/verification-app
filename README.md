# Email Verification System

This project is an Email Verification System designed to integrate with account signup processes. It leverages Node.js and Express to verify if an email address belongs to a business domain or a known free email provider. The application also uses DNS MX record lookups to validate business email domains and includes rate limiting to prevent abuse.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js (v14.x or later)
- NPM (v6.x or later)

## Installation

To install the Email Verification System, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-project-name.git

2. Navigate into the project directory:

cd your-project-name

3. Install the dependencies:

npm install

## Usage
To start the server, run the following command in your terminal:

npm start

The server will start running on http://localhost:3001. You can adjust the port by setting the PORT environment variable in your environment or using a .env file.

## Endpoints

GET /: Displays a welcome message for the Email Verification Service.

POST /verify-email: Accepts a JSON payload with an email field to verify if it's from a business domain. The response will indicate success or failure along with an appropriate message.

Example Request:

{
  "email": "user@example.com"
}
Example Response:
json
Copy code
{
  "success": true,
  "message": "Valid business email domain"
}

## Rate Limiting
Requests to the /verify-email endpoint are rate-limited to 100 requests per 15 minutes per IP address to prevent abuse. If the limit is exceeded, the server will respond with a 429 Too Many Requests status and a message to try again later.

## Contributing
Contributions to the Email Verification System are welcome. Please follow the standard pull request process for your contributions.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
If you have any questions or feedback, please reach out to the project maintainer at your-email@example.com.
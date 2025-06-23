// netlify/functions/chat-bot.js

// Import necessary modules
const express = require('express');
const serverless = require('serverless-http');

// Initialize the Express app
const app = express();

// Create an Express Router
// This router will define our API endpoints.
const router = express.Router();

// Middleware to parse JSON request bodies.
// This is essential for receiving data sent from the frontend via POST requests
// (e.g., the user's message).
app.use(express.json());

/**
 * @route POST /
 * @description Handles incoming chat messages, processes them, and returns a simple bot response.
 *
 * This function serves as the backend for the EchoChat bot. It's designed to be
 * deployed as a Netlify Function.
 *
 * IMPORTANT NOTE ON PATHING FOR NETLIFY FUNCTIONS:
 * When Netlify invokes this function (`chat-bot.js`) through a redirect (e.g.,
 * `from = "/api/chat-bot"` to `to = "/.netlify/functions/chat-bot"` in `netlify.toml`),
 * the `serverless-http` library correctly maps the incoming request to the root path (`/`)
 * of the Express application within this function. Therefore, the route defined
 * here should be `/` to handle the request that lands at the function's base URL.
 * This ensures that a frontend call to `/api/chat-bot` successfully triggers this handler.
 *
 * @param {object} req - The request object provided by Express.
 * @param {object} req.body - The request body, expected to be a JSON object.
 * @param {string} req.body.message - The text content of the user's message. This is a required field.
 * @param {object} res - The response object provided by Express.
 *
 * @returns {object} JSON response containing the bot's reply or an error message.
 *   - On successful processing (HTTP 200 OK):
 *     `{ "botResponse": "Echo: [user's message]" }`
 *   - On invalid request (HTTP 400 Bad Request):
 *     `{ "error": "Message parameter is required." }` (e.g., `message` is missing from body)
 *   - On unexpected server-side error (HTTP 500 Internal Server Error):
 *     `{ "error": "Internal server error." }`
 */
router.post('/', (req, res) => {
    // Extract the 'message' field from the request body.
    const { message } = req.body;

    // --- Request Validation ---
    // Check if the 'message' parameter is present. This is crucial for valid input.
    if (!message) {
        // Return a 400 Bad Request if 'message' is missing, as per API specification.
        // This ensures proper error handling for malformed requests.
        console.warn('Bad Request: Missing "message" parameter in request body.');
        return res.status(400).json({ error: 'Message parameter is required.' });
    }

    // --- Core Bot Logic and Error Handling ---
    try {
        // Implement the simple bot logic: prepend "Echo: " to the received message.
        // This fulfills the core functionality requirement of the "incredibly simple" bot.
        const botResponse = `Echo: ${message}`;

        // Log the interaction for debugging and monitoring purposes.
        console.log(`Received message: "${message}" -> Bot response: "${botResponse}"`);

        // Send back the processed message as a JSON response with a 200 OK status.
        // This adheres to the API Endpoints Specification for a successful response.
        return res.status(200).json({ botResponse });
    } catch (error) {
        // --- Proper Error Handling for Server Issues ---
        // Catch any unexpected errors that might occur during processing.
        // Log the error for server-side debugging.
        console.error('Error processing chat message:', error);
        // Return a 500 Internal Server Error to the client, fulfilling the API specification.
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// Mount the router on the Express app.
// For a single Netlify Function acting as an API endpoint, mounting the router
// directly at the root path ('/') of the Express app is the standard and most
// robust pattern when using `serverless-http`.
app.use('/', router);

// Export the handler for Netlify Functions.
// The `serverless-http` library wraps the Express application, making it
// compatible with the AWS Lambda event structure that Netlify Functions use.
// This is the entry point for Netlify to execute our serverless function.
exports.handler = serverless(app);
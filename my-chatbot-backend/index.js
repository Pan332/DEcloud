const express = require('express');
const axios = require('axios'); // For HTTP requests
const cors = require('cors');
const multer = require('multer'); // For handling file uploads

require('dotenv').config({ path: '../google-gemini/.env' });

const app = express();
const upload = multer(); // Multer instance for parsing multipart/form-data

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3001'], // Adjust based on your frontend port
    methods: ['GET', 'POST'],
}));
app.use(express.json()); // To parse JSON payloads

// AI API Configuration
const aiApiUrl = process.env.AI_API_URL;

if (!aiApiUrl) {
    console.error(`[${new Date().toISOString()}] Error: AI_API_URL is not defined in the environment variables.`);
    process.exit(1); // Exit the application if the environment variable is missing
}

// Endpoint to receive messages from the frontend
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[${new Date().toISOString()}] Incoming message: ${message}`);

    try {
        // Send the message to the AI API
        const response = await axios.post(aiApiUrl, { prompt: message }, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(`[${new Date().toISOString()}] Response from AI API:`, response.data);

        res.status(200).json({ response: response.data.response || 'No response received from AI API' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error communicating with AI API:`, error.message);
        res.status(500).json({ error: 'Error communicating with AI API' });
    }
});

// Endpoint to process PDF files and send to AI API
app.post('/api/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const { originalname, buffer } = file; // Extract file data
        console.log(`[${new Date().toISOString()}] Received file: ${originalname}`);

        // Send the file to the AI API
        const aiResponse = await axios.post(aiApiUrl, buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${originalname}"`,
            },
        });

        console.log(`[${new Date().toISOString()}] Response from AI API:`, aiResponse.data);

        res.status(200).json({ response: aiResponse.data.response || 'No response received from AI API' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error communicating with AI API:`, error.message);
        res.status(500).json({ error: 'Error processing file with AI API' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// Start the server
const PORT = process.env.PORT || 3399;
app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server listening on port ${PORT}`);
});

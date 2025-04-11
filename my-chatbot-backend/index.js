const express = require('express');
const axios = require('axios'); // For HTTP requests
const cors = require('cors');
const multer = require('multer'); // For handling file uploads

require('dotenv').config({ path: './.env' });

const app = express();
const upload = multer(); // Multer instance for parsing multipart/form-data

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:80','http://localhost:4001','http://localhost:3000','http://localhost:3001'], 
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type'],
  };

app.use(cors(corsOptions));
app.use(express.json());

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
        console.log(`[${new Date().toISOString()}] Error: No message provided`);
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const aiPayload = { message };
        console.log("Forwarding payload to AI API:", aiPayload);
    
        const aiResponse = await axios.post("http://localhost:4001/api/chat", aiPayload);
    
        console.log("Response from AI API:", aiResponse.data);
    
        res.status(200).json(aiResponse.data);
      } catch (error) {
        console.error("Error communicating with AI API:", error.response?.data || error.message);
    
        res.status(500).json({
          error: error.response?.data?.error || "Error communicating with AI API",
        });
      }
    });

// Endpoint to process PDF files and send to AI API
app.post('/api/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    console.log(`[${new Date().toISOString()}] /api/upload-pdf endpoint called`);

    const { file } = req;
    if (!file) {
        console.log(`[${new Date().toISOString()}] Error: No file uploaded`);
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const { originalname, buffer } = file; // Extract file data
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
    console.log(`[${new Date().toISOString()}] /api/health endpoint called`);
    res.status(200).json({ status: 'API is running' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server listening on port ${PORT}`);
});

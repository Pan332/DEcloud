const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Set up environment variables
const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

// Gemini AI configuration options
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

// Set up Gemini model
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  geminiConfig,
});

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to receive chat messages from the frontend
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  console.log("Received message from client:", message);

  try {
    // Generate a response using Gemini
    const result = await geminiModel.generateContent(message);
    const responseText = result.response.text();  // Get the response text

    console.log("Generated result:", responseText);

    // Send the response back to the client
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "An error occurred during content generation" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

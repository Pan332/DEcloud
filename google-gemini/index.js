const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const WebSocket = require("ws");  // CommonJS `require` for WebSocket
dotenv.config();

const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  geminiConfig,
});

const PORT = process.env.PORT || 4001;

// WebSocket Server
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    const clientMessage = message.toString();
    console.log("Received message from client:", clientMessage);
  
    try {
      // Generate a response using Gemini
      const result = await geminiModel.generateContent(clientMessage);
      const result_real = result.response;
      console.log("Generated result:", result_real.text()); // Log the structure for debugging
  
      // Send the response back to the client
      ws.send(JSON.stringify({ type: 'geminiResponse', text: result_real.text() })); 
    } catch (error) {
      console.error("Error generating response:", error);
      ws.send(JSON.stringify({ type: 'error', message: 'An error occurred.' }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log(`WebSocket server listening on port ${PORT}`);

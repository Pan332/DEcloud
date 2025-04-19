const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

app.use(express.json());

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 2048,
  },
});

app.post("/api/chat", async (req, res) => {
  const { message, role = "Software Engineer" } = req.body;

  let prompt;

  if (message === '__WRAP_UP__') {
    prompt = `
You are a professional interviewer conducting a mock interview for the role of ${role}.
Wrap up the interview with:
1. A brief summary of the candidate's performance.
2. Key strengths and areas for improvement.
3. A thank you note or encouragement.

Keep it professional and under 250 words.
`;
  } else {
    prompt = `
You are a professional interviewer for the role of ${role}.
Conduct a mock interview with the candidate.
Ask questions one at a time. After each candidate response, give concise feedback, then move to the next question.

Candidate said: "${message}"
`;
  }

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini server running on port ${PORT}`);
});

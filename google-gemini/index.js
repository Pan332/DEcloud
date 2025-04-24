const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

app.use(express.json());
app.use(cors());

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 2048,
  },
});

app.post("/api/chat", async (req, res) => {
  const { message, role = "Software Engineer", history = "" } = req.body;

  let prompt;

  if (message === '__WRAP_UP__') {
  prompt = `
You are a professional interviewer reviewing a candidate's mock interview for the role of ${role}.

Below is the interview transcript:
${history}

Please provide **only feedback**, including:
1. A brief summary of the candidate's overall performance.
2. Key strengths.
3. Areas for improvement.
4. Use simple language that a third grader or my grandma could understand.
5. Do NOT ask any further questions or continue the interview.

Keep it professional and under 250 words.
`;
  } else {
    prompt = `
Provide **brief and specific feedback** on the candidate's answer, focusing on clarity, completeness, and relevance.
You are a professional interviewer for the role of ${role}.
Conduct a mock interview with the candidate.

Instructions:
1. Ask one interview question at a time.
2. Wait for the candidate's response.
3. Then move to the **next question**.
4. Use word that conways emotions.

Candidate's response: "${message}"
Respond as the interviewer:
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

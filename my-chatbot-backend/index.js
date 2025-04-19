const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

const aiApiUrl = "http://localhost:4001/api/chat";

app.post('/api/chat', async (req, res) => {
  const { message, role } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const response = await axios.post(aiApiUrl, { message, role });
    res.status(200).json(response.data);
  } catch (err) {
    console.error("AI API error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Error communicating with AI API' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

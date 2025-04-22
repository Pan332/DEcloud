const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.ATLAS_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// Feedback API
app.post('/api/feedback', async (req, res) => {
  const { feedback, role } = req.body;

  if (!feedback || !role) {
    return res.status(400).json({ error: 'Feedback and role are required' });
  }

  try {
    const db = client.db("feedback");
    const collection = db.collection("feedback");

    await collection.insertOne({
      feedback,
      role,
      createdAt: new Date()
    });

    res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`📝 Feedback API running on port ${PORT}`));

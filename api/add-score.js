// File: api/add-score.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await client.connect();
    const db = client.db('leaderboard'); // Database name
    const collection = db.collection('scores'); // Collection name

    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid name or score' });
    }

    await collection.insertOne({ name, score, createdAt: new Date() });
    return res.status(201).json({ message: 'Score added' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to database' });
  } finally {
    await client.close();
  }
  //redeploy
}
// File: api/get-word.js
import { MongoClient } from 'mongodb';

// --- We can reuse the connection logic from your other API files ---
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to your environment variables');
}

const getDb = async () => {
  if (!clientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  await clientPromise;
  return client.db('leaderboard'); // Still using the 'leaderboard' database
};
// --- End of connection logic ---

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const collection = db.collection('words'); // The new collection we created

    // This is the MongoDB query to fetch one random document
    const randomWordDoc = await collection.aggregate([
      { $sample: { size: 1 } }
    ]).toArray();

    if (randomWordDoc.length === 0) {
      return res.status(404).json({ error: 'No words found in the database' });
    }

    // Send the first (and only) document back to the game
    return res.status(200).json(randomWordDoc[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch word from database' });
  }
}
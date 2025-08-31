import { MongoClient } from 'mongodb';

// (The database connection logic at the top remains the same)
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
  return client.db('leaderboard');
};

export default async function handler(req, res) {
  try {
    // --- Daily Leaderboard Logic ---
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const db = await getDb();
    const collection = db.collection('scores');

    // Find scores created within the current day
    const topScores = await collection
      .find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    return res.status(200).json(topScores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
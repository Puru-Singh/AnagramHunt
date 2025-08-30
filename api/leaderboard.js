// // File: api/leaderboard.js
// import { MongoClient } from 'mongodb';

// const client = new MongoClient(process.env.MONGODB_URI);

// export default async function handler(req, res) {
//   try {
//     await client.connect();
//     const db = client.db('leaderboard');
//     const collection = db.collection('scores');

//     const topScores = await collection
//       .find()
//       .sort({ score: -1 }) // Sort by score descending
//       .limit(10) // Get top 10
//       .toArray();

//     return res.status(200).json(topScores);
//   } catch (error) {
//     return res.status(500).json({ error: 'Failed to connect to database' });
//   } finally {
//     await client.close();
//   }
// }

// File: api/leaderboard.js

export default function handler(req, res) {
  // This function now just sends a simple success message.
  // No database connection, no complexity.
  res.status(200).json({ message: "Hello from the API!" });
}
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
    // --- Timezone-Specific Daily Leaderboard Logic ---
    
    // 1. Get current time in UTC
    const now = new Date();

    // 2. Calculate the IST offset in milliseconds (5 hours * 60 mins + 30 mins) * 60 secs * 1000 ms
    const istOffset = (5 * 60 + 30) * 60 * 1000;
    
    // 3. Create a new Date object for IST
    const istTime = new Date(now.getTime() + istOffset);

    // 4. Calculate the start and end of the day in UTC, based on the IST date
    const startOfDayUTC = new Date(istTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
    // Adjust for the offset to get the correct start time in UTC
    const startOfDay = new Date(startOfDayUTC.getTime() - istOffset);
    const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1); // 24 hours minus 1 millisecond

    const db = await getDb();
    const collection = db.collection('scores');

    // 5. Find scores created within the calculated UTC range for the IST day
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
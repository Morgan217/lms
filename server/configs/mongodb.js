import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

export default async function connectToMongoDB() {
  const username = encodeURIComponent(process.env.DB_USERNAME);
  const password = encodeURIComponent(process.env.DB_PASSWORD);

  const uri = `mongodb+srv://${username}:${password}@cluster0.x5gminq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  } finally {
    await client.close();
  }
}

// server/configs/mongodb.js
import mongoose from 'mongoose';
import 'dotenv/config';

export default async function connectToMongoDB() {
  // Read username and password from environment variables
  const username = encodeURIComponent(process.env.DB_USERNAME);
  const password = encodeURIComponent(process.env.DB_PASSWORD);

  // MongoDB Atlas connection string
  const uri = `mongodb+srv://${username}:${password}@cluster0.x5gminq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB successfully (via Mongoose)!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1); // stop server if DB connection fails
  }
}

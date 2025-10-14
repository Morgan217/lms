import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectToMongoDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhook.js';

// Initialize express
const app = express();

// Connect to DB
await connectToMongoDB();

// Middlewares
app.use(cors());
app.use(express.json()); // You can also enable this globally

// Routes
app.get('/', (req, res) => res.send("API Working"));
app.post('/clerk', clerkWebhooks);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectToMongoDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks, testerUpdateDB } from './controllers/webhook.js';
import educatorRoute from './routes/educatorRoutes.js';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRouter.js';

// Initialize express
const app = express();

// Connect to MongoDB & Cloudinary
await connectToMongoDB();
await connectCloudinary();

// Global middlewares that won't affect Stripe
app.use(cors());

// ✅ Stripe Webhook FIRST (before express.json)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Then add express.json for everything else
app.use(express.json());
app.use(clerkMiddleware()); // parses Clerk auth headers

// Routes
app.get('/', (req, res) => res.send("API Working"));
app.post('/clerk', clerkWebhooks);
app.use('/api/educator', requireAuth(), educatorRoute);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// Test route
app.post("/test-purchase-complete", testerUpdateDB);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

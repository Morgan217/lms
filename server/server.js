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

// Connect to MongoDB
await connectToMongoDB();
await connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware()); // Parses Clerk auth headers

// Routes
app.get('/', (req, res) => res.send("API Working"));
app.post('/clerk', clerkWebhooks);
app.use('/api/educator', requireAuth(), educatorRoute);// Educator route: require authentication so req.auth.userId exists
app.use('/api/course',express.json(),courseRouter);
app.use('/api/user',express.json(),userRouter);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

//test
app.post("/test-purchase-complete", testerUpdateDB);


// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});

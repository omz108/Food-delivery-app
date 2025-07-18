import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes';
import userRoute from './routes/userRoutes';
import cartRoutes from './routes/cartRoutes';
import prisma, { safeConnectPrisma } from './lib/prismaClient';

dotenv.config()

const app = express();
const PORT = 3000;

app.use(json());
app.use(cookieParser());

const devOrigions = ['http://localhost:5173']
const prodOrigins = ['https://hungerbox.online','https://www.hungerbox.online'];

const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigions;

app.use(cors({
    origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
    credentials: true
}))

app.get('/foodList', async (req, res) => {
    try {
        const foodList = await prisma.foodItem.findMany();
        res.status(200).json(foodList);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
})


app.use('/admin', adminRoutes);
app.use('/user', userRoute);
app.use('/cart', cartRoutes);

// ✅ Start server only after DB connection
async function startServer() {
    try {
      await safeConnectPrisma(); // Ensure DB is connected (even if cold-start)
  
      app.listen(PORT, () => {
        console.log(`✅ Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("❌ Failed to start server due to DB connection error:", error);
      process.exit(1);
    }
  }
  
  startServer();


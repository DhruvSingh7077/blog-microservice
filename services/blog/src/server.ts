// import express from "express";
// import dotenv from "dotenv";
// import blogRoutes from "./routes/blog.js";
// import { createClient } from "redis";
// import cors from "cors";
// import { startCacheConsumer } from "./utils/consumer.js";
// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cors());
// const port = process.env.PORT;

// startCacheConsumer();

// export const redisClient = createClient({
//   url: process.env.REDIS_URL as string,
// });

// redisClient
//   .connect()
//   .then(() => console.log("Connected to Redis"))
//   .catch(console.error);

// app.use("/api/v1", blogRoutes);
// app.listen(port, () => {
//   console.log(`Blog service is running on port ${port}`);
// });
import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import cors from "cors";
import { startCacheConsumer } from "./utils/consumer.js";

dotenv.config();

const app = express();

// ===== CRITICAL FIX: CORS Configuration =====
// This MUST come BEFORE routes
const corsOptions = {
  origin: [
    'https://blogfrontend-ecru.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['Content-Length'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5002;

// ===== Redis Client with Better Error Handling =====
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      const delay = Math.min(retries * 100, 3000);
      console.log(`🔄 Retrying Redis connection (${retries}/10) in ${delay}ms...`);
      return delay;
    }
  }
});

// Redis event listeners
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔌 Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

redisClient.on('end', () => {
  console.log('🔌 Redis connection closed');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis successfully');
    
    // Start cache consumer after Redis is connected
    startCacheConsumer();
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
    console.log('⚠️  Server will continue without Redis caching');
    // Server continues running even if Redis fails
  }
})();

// ===== Health Check Endpoint =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'blog-microservice',
    redis: redisClient.isReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    port: port,
  });
});

// ===== Test Endpoint =====
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Blog microservice is working!',
    timestamp: new Date().toISOString(),
  });
});

// ===== Blog Routes =====
app.use("/api/v1", blogRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ===== Global Error Handler =====
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ===== Graceful Shutdown =====
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

// ===== Start Server =====
app.listen(port, () => {
  console.log('\n🚀 ========================================');
  console.log(`🚀 Blog service running on port ${port}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
  console.log('🚀 ========================================\n');
});

export default app;
import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import cors from "cors";
import { startCacheConsumer } from "./utils/consumer.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
const port = process.env.PORT;

startCacheConsumer();

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});

redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch(console.error);

app.use("/api/v1", blogRoutes);
app.listen(port, () => {
  console.log(`Blog service is running on port ${port}`);
});

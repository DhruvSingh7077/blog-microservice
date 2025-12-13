import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
dotenv.config();

const app = express();

const port = process.env.PORT;

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

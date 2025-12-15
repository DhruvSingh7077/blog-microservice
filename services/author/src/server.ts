import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
import { v2 as cloudinary } from "cloudinary";
import { connectRabbitMQ } from "./utils/rabbitmq.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.Cloud_Name as string,
  api_key: process.env.Cloud_Api_Key as string,
  api_secret: process.env.Cloud_Api_Secret as string,
});

// Routes
app.use("/api/v1", blogRoutes);

const port = Number(process.env.PORT) || 5001;

// DB initialization
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(250) UNIQUE NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(250) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS savedblogs (
        id SERIAL PRIMARY KEY,
        userid VARCHAR(250) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating database tables:", error);
    process.exit(1);
  }
}

// App bootstrap
async function start() {
  await initDB();

  app.listen(port, async () => {
    console.log(`🚀 Author service is running on port ${port}`);

    try {
      await connectRabbitMQ();
      console.log("🐰 RabbitMQ connected and ready");
    } catch (err) {
      console.error("❌ RabbitMQ startup failed", err);
    }
  });
}

start();

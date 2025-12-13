import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloud_Name as string,
  api_key: process.env.Cloud_Api_Key as string,
  api_secret: process.env.Cloud_Api_Secret as string,
});

const app = express();

const port = process.env.PORT;

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS blogs(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(250) UNIQUE NOT NULL,
    blogcontent TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ;`;

    await sql`
    CREATE TABLE IF NOT EXISTS comments(
    id SERIAL PRIMARY KEY,
    comment VARCHAR(255) NOT NULL,
    userid VARCHAR(250)  NOT NULL,
    username VARCHAR(255) NOT NULL,
    blogid VARCHAR(255) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ); `;
    await sql`
    CREATE TABLE IF NOT EXISTS savedblogs(
    id SERIAL PRIMARY KEY,
    userid VARCHAR(250)  NOT NULL,
    blogid VARCHAR(255) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
     `;
    console.log("Database tables created successfully");
  } catch (error) {
    console.log("Error creating database tables:", error);
  }
}

app.use("/api/v1", blogRoutes);
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Author service is running on port ${port}`);
  });
});

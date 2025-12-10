import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI; // Match your .env
    if (!uri) {
      throw new Error("MONGO_URI missing from .env");
    }
    await mongoose.connect(uri, {
      dbName: "blog",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit on DB failure
  }
};
export default connectDb;

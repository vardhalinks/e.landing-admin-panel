// backend/src/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI is not set. Please set it in your .env or environment variables.");
      return;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Full error:", err);
    console.error(
      "Common causes: incorrect URI, password needing URL-encoding, or Atlas IP whitelist blocking access."
    );
    console.error(
      "If you're using MongoDB Atlas, add your current IP (or 0.0.0.0/0) in Network Access: https://www.mongodb.com/docs/atlas/security-whitelist/"
    );
    process.exit(1);
  }
};

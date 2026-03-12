const mongoose = require("mongoose");

const connectDB = async () => {
  // fall back to a sensible local URI if environment variable is missing
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pennywise";

  try {
    const conn = await mongoose.connect(uri, {
      // optional settings can be added here if needed
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error (${uri}): ${error.message}`);
    // give user more context before exiting
    console.error("Please ensure MongoDB is running and MONGO_URI is set in .env");
    process.exit(1);
  }
};

module.exports = connectDB;

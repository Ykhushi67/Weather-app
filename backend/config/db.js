import mongoose from "mongoose";
import { setServers } from "node:dns/promises";

// Some networks/ISPs block or mishandle the DNS SRV lookup that
// mongodb+srv:// needs. Forcing Google/Cloudflare DNS here fixes that.
setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn(
      "⚠️  MONGO_URI not set — MongoDB skipped. Auth & Favorites features will be unavailable. Weather/forecast APIs will work normally."
    );
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.warn("⚠️  Continuing without MongoDB. Auth & Favorites will be unavailable.");
  }
};

export default connectDB;

import { setServers } from "node:dns/promises";
setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Weather app API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/favorites", favoriteRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

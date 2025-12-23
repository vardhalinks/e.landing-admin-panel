// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import sectionRoutes from "./src/routes/sectionRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import { Section } from "./src/models/Section.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Public hero endpoint for website consumption
app.get("/api/hero", async (req, res) => {
  try {
    const hero = await Section.findOne({ key: "hero" });
    if (!hero) return res.status(404).json({ message: "Hero not found" });
    res.json(hero);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

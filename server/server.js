const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const schemesRouter      = require("./routes/schemes");
const adminSchemesRouter = require("./routes/adminSchemes");
const authRouter         = require("./routes/auth");
const { startScheduler } = require("./scraper/index");

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ── Routes ──────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/schemes", schemesRouter);
app.use("/api/admin/schemes", adminSchemesRouter);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// ── DB + Server start ────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);

      // Start the daily cron scraper
      startScheduler();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

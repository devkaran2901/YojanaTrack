const cron              = require("node-cron");
const mongoose          = require("mongoose");
const scrapeMyScheme    = require("./mySchemeScraper");
const scrapeVikaspedia  = require("./vikaspediaScraper");
const fallbackSchemes   = require("./fallbackData");
const { saveSchemes, logFailure } = require("./dbSaver");
const { notifyMatchingUsers }     = require("./notifier");
require("dotenv").config();

// ─────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  }
};

// ─────────────────────────────────────────────
// Full pipeline:
//   1. Scrape myscheme.gov.in
//   2. Scrape vikaspedia.in (backup)
//   3. Save all to MongoDB (upsert)
//   4. Notify users about new schemes
// ─────────────────────────────────────────────
const runFullScrape = async () => {
  console.log("\n==============================");
  console.log(`SCRAPE RUN — ${new Date().toLocaleString("en-IN")}`);
  console.log("==============================\n");

  await connectDB();

  let allNewSchemes = [];

  // ── Source 1: myscheme.gov.in ──
  try {
    const schemes = await scrapeMyScheme();
    const { newSchemes } = await saveSchemes(schemes, "myscheme");
    allNewSchemes.push(...newSchemes);
  } catch (err) {
    console.error("[myscheme] Scrape failed:", err.message);
    await logFailure("myscheme", err, 0);
  }

  // ── Source 2: vikaspedia.in ──
  try {
    const schemes = await scrapeVikaspedia();
    const { newSchemes } = await saveSchemes(schemes, "vikaspedia");
    allNewSchemes.push(...newSchemes);
  } catch (err) {
    console.error("[vikaspedia] Scrape failed:", err.message);
    await logFailure("vikaspedia", err, 0);
  }

  // ── Fallback: if nothing new was found from live sources,
  //    seed with a small curated set so the app is never empty.
  if (allNewSchemes.length === 0) {
    console.log("⚠️  No new schemes found from live sources. Using fallback seed data.");
    try {
      const { newSchemes } = await saveSchemes(fallbackSchemes, "fallback");
      allNewSchemes.push(...newSchemes);
    } catch (err) {
      console.error("[fallback] Failed to seed schemes:", err.message);
    }
  }

  // ── Notify users about brand new schemes ──
  await notifyMatchingUsers(allNewSchemes);

  console.log("\n✅ Scrape run complete.");
  console.log(`   Total new schemes this run: ${allNewSchemes.length}`);
  console.log("==============================\n");
};

// ─────────────────────────────────────────────
// Schedule: runs every day at 6:00 AM IST
// Cron format: minute hour day month weekday
// ─────────────────────────────────────────────
const startScheduler = () => {
  console.log("⏰ Scraper scheduler started.");
  console.log("   Runs daily at 06:00 AM IST\n");

  cron.schedule(
    "0 6 * * *",              // every day at 6 AM
    runFullScrape,
    { timezone: "Asia/Kolkata" }
  );
};

// ─────────────────────────────────────────────
// Allow running manually from CLI:
//   node scraper/index.js --run
// ─────────────────────────────────────────────
if (process.argv.includes("--run")) {
  runFullScrape()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { startScheduler, runFullScrape };

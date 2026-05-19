const Scheme    = require("../models/Scheme");
const ScrapeLog = require("../models/ScrapeLog");

// ─────────────────────────────────────────────
// Save scraped schemes to MongoDB
// Uses upsert: if name already exists → update it
//              if new → insert and mark pendingNotification: true
// ─────────────────────────────────────────────
const saveSchemes = async (schemes, source) => {
  let added   = 0;
  let updated = 0;
  const newSchemes = [];

  for (const scheme of schemes) {
    if (!scheme.name || scheme.name.length < 3) continue;

    try {
      // Check if this scheme already exists
      const existing = await Scheme.findOne({ name: scheme.name });

      if (existing) {
        // Update existing — but don't reset pendingNotification (already notified)
        await Scheme.findOneAndUpdate(
          { name: scheme.name },
          {
            $set: {
              description:         scheme.description,
              category:            scheme.category,
              benefit:             scheme.benefit,
              sourceUrl:           scheme.sourceUrl,
              ministry:            scheme.ministry,
              eligibilityCriteria: scheme.eligibilityCriteria,
              documents:           scheme.documents,
              scrapedAt:           scheme.scrapedAt,
            },
          }
        );
        updated++;
      } else {
        // Brand new scheme — mark pendingNotification: true so notification job picks it up
        const created = await Scheme.create({ ...scheme, pendingNotification: true });
        newSchemes.push(created);
        added++;
      }
    } catch (err) {
      // Skip duplicates or validation errors silently
      if (err.code !== 11000) {
        console.error(`  DB error for "${scheme.name}":`, err.message);
      }
    }
  }

  console.log(`  DB: ${added} added, ${updated} updated`);

  // Log this scrape run
  await ScrapeLog.create({
    source,
    status:         "success",
    schemesFound:   schemes.length,
    schemesAdded:   added,
    schemesUpdated: updated,
    ranAt:          new Date(),
  });

  return { added, updated, newSchemes };
};

// ─────────────────────────────────────────────
// Log a failed scrape run
// ─────────────────────────────────────────────
const logFailure = async (source, error, duration) => {
  await ScrapeLog.create({
    source,
    status:   "failed",
    error:    error.message,
    duration,
    ranAt:    new Date(),
  });
};

module.exports = { saveSchemes, logFailure };

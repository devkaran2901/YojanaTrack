const mongoose = require("mongoose");

const scrapeLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "partial"],
      required: true,
    },
    schemesFound:   { type: Number, default: 0 },
    schemesAdded:   { type: Number, default: 0 },
    schemesUpdated: { type: Number, default: 0 },
    error:          { type: String, default: null },
    duration:       { type: Number, default: 0 },
    ranAt:          { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model("ScrapeLog", scrapeLogSchema);

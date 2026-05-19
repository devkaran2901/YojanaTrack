const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Agriculture", "Education", "Health", "Housing", "Business", "Welfare", "Women", "Other", "Infrastructure", "Technology", "Renewable Energy"],
      default: "Other",
    },
    benefit: {
      type: String,
      default: "Check official site",
    },
    deadline: {
      type: String,
      default: "Ongoing",
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    ministry: {
      type: String,
      default: "",
    },
    eligibilityCriteria: {
      minAge:        { type: Number, default: null },
      maxAge:        { type: Number, default: null },
      maxIncome:     { type: Number, default: null },
      gender:        { type: String, default: "any" },
      states:        { type: [String], default: [] },
      casteCategory: { type: [String], default: [] },
      occupation:    { type: [String], default: [] },
    },
    documents: {
      type: [String],
      default: [],
    },
    applicationProcess: {
      type: String,
      default: "",
    },
    exclusions: {
      type: [String],
      default: [],
    },
    faqs: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: "📄",
    },
    state: {
      type: String,
      default: "Central",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    pendingNotification: {
      type: Boolean,
      default: true,       // flipped to false after users are notified
    },
  },
  { timestamps: true }
);

// Full-text search index on name + description
schemeSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Scheme", schemeSchema);

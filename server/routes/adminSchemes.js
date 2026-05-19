const express = require("express");
const Scheme  = require("../models/Scheme");

const router = express.Router();

// ─────────────────────────────────────────────
// Simple admin auth using a shared secret header
// Header: x-admin-secret: <ADMIN_SECRET>
// Set ADMIN_SECRET in server/.env
// ─────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ error: "ADMIN_SECRET is not configured on the server" });
  }

  const provided = req.header("x-admin-secret");
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

router.use(requireAdmin);

// ─────────────────────────────────────────────
// GET /api/admin/schemes
// List schemes with basic filters
// ?q=&category=&page=&limit=
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const schemes = await Scheme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scheme.countDocuments(query);

    res.json({
      schemes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/schemes
// Create a new scheme
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    const scheme = await Scheme.create({
      name: payload.name,
      description: payload.description || "",
      category: payload.category || "Other",
      benefit: payload.benefit || "Check official site",
      deadline: payload.deadline || "Ongoing",
      sourceUrl: payload.sourceUrl || "",
      ministry: payload.ministry || "",
      eligibilityCriteria: {
        minAge: payload.eligibilityCriteria?.minAge ?? null,
        maxAge: payload.eligibilityCriteria?.maxAge ?? null,
        maxIncome: payload.eligibilityCriteria?.maxIncome ?? null,
        gender: payload.eligibilityCriteria?.gender || "any",
        states: payload.eligibilityCriteria?.states || [],
        casteCategory: payload.eligibilityCriteria?.casteCategory || [],
        occupation: payload.eligibilityCriteria?.occupation || [],
      },
      documents: payload.documents || [],
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    res.status(201).json(scheme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/schemes/:id
// Update an existing scheme
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};

    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: payload.name,
          description: payload.description,
          category: payload.category,
          benefit: payload.benefit,
          deadline: payload.deadline,
          sourceUrl: payload.sourceUrl,
          ministry: payload.ministry,
          eligibilityCriteria: {
            minAge: payload.eligibilityCriteria?.minAge ?? null,
            maxAge: payload.eligibilityCriteria?.maxAge ?? null,
            maxIncome: payload.eligibilityCriteria?.maxIncome ?? null,
            gender: payload.eligibilityCriteria?.gender || "any",
            states: payload.eligibilityCriteria?.states || [],
            casteCategory: payload.eligibilityCriteria?.casteCategory || [],
            occupation: payload.eligibilityCriteria?.occupation || [],
          },
          documents: payload.documents || [],
          isActive:
            payload.isActive !== undefined ? payload.isActive : undefined,
        },
      },
      { new: true, runValidators: true }
    );

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json(scheme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/admin/schemes/:id/toggle-active
// Enable / disable a scheme
// ─────────────────────────────────────────────
router.patch("/:id/toggle-active", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    scheme.isActive = !scheme.isActive;
    await scheme.save();

    res.json(scheme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/schemes/:id
// Hard delete a scheme
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


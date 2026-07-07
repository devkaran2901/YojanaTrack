const express  = require("express");
const router   = express.Router();
const Scheme   = require("../models/Scheme");


// ─────────────────────────────────────────────
// GET /api/schemes
// Browse all schemes with search + category filter
// ?q=kisan&category=Agriculture&page=1&limit=20
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    // Full-text search using MongoDB text index
    if (q && q.trim()) query.$text = { $search: q.trim() };

    // Category filter
    if (category && category !== "All") query.category = category;

    const skip    = (parseInt(page) - 1) * parseInt(limit);
    const schemes = await Scheme.find(query)
      .sort( q ? { score: { $meta: "textScore" } } : { createdAt: -1 } )
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scheme.countDocuments(query);

    res.json({ schemes, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/schemes/match
// Send user profile → get matched + near-miss schemes
// Body: { age, income, gender, state, occupation, casteCategory }
// ─────────────────────────────────────────────
router.post("/match", async (req, res) => {
  try {
    const user     = req.body;
    const schemes  = await Scheme.find({ isActive: true });

    const isEligible = (scheme) => {
      const c = scheme.eligibilityCriteria;
      if (!c) return true;
      if (c.minAge    && user.age    < c.minAge)    return false;
      if (c.maxAge    && user.age    > c.maxAge)    return false;
      if (c.maxIncome && user.income > c.maxIncome) return false;
      if (c.gender && c.gender !== "any" && c.gender !== user.gender) return false;
      if (c.states?.length && !c.states.includes(user.state)) return false;
      if (c.casteCategory?.length && !c.casteCategory.includes(user.casteCategory)) return false;
      if (c.occupation?.length && !c.occupation.includes(user.occupation)) return false;
      return true;
    };

    const getScore = (scheme) => {
      const c = scheme.eligibilityCriteria;
      if (!c) return 1;
      let total = 0, passed = 0;
      if (c.minAge != null)    { total++; if (user.age    >= c.minAge)    passed++; }
      if (c.maxAge != null)    { total++; if (user.age    <= c.maxAge)    passed++; }
      if (c.maxIncome != null) { total++; if (user.income <= c.maxIncome) passed++; }
      if (c.gender && c.gender !== "any") { total++; if (c.gender === user.gender) passed++; }
      if (c.states?.length)    { total++; if (c.states.includes(user.state)) passed++; }
      if (c.casteCategory?.length) { total++; if (c.casteCategory.includes(user.casteCategory)) passed++; }
      if (c.occupation?.length)    { total++; if (c.occupation.includes(user.occupation)) passed++; }
      return total ? passed / total : 1;
    };

    const matched  = schemes.filter(isEligible);
    const nearMiss = schemes
      .filter((s) => !isEligible(s) && getScore(s) >= 0.6)
      .map((s) => ({ ...s.toObject(), score: getScore(s) }))
      .sort((a, b) => b.score - a.score);

    res.json({ matched, nearMiss, totalMatched: matched.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/schemes/:id
// Single scheme detail
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: "Scheme not found" });
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { signToken, authMiddleware, requireRole } = require("../utils/jwt");

const router = express.Router();

// POST /api/auth/signup  (regular users only)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "user",
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, age: user.age, income: user.income, gender: user.gender, state: user.state, casteCategory: user.casteCategory, occupation: user.occupation },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login  (shared for users + admins)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, age: user.age, income: user.income, gender: user.gender, state: user.state, casteCategory: user.casteCategory, occupation: user.occupation },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -inviteToken");
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, age: user.age, income: user.income, gender: user.gender, state: user.state, casteCategory: user.casteCategory, occupation: user.occupation });
});

// PUT /api/auth/profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { age, income, gender, state, casteCategory, occupation } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { age, income, gender, state, casteCategory, occupation },
      { new: true }
    );
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, age: user.age, income: user.income, gender: user.gender, state: user.state, casteCategory: user.casteCategory, occupation: user.occupation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN INVITES

// POST /api/auth/admin/invite  (admin-only; creates admin with inviteToken)
router.post("/admin/invite", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const inviteToken = crypto.randomBytes(24).toString("hex");

    const user = await User.create({
      email,
      name: name || "Admin",
      passwordHash: "-", // temp; will be set on accept
      role: "admin",
      inviteToken,
    });

    res.json({
      inviteToken,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/admin/accept  (used by /invite?token=..)
router.post("/admin/accept", async (req, res) => {
  try {
    const { token, email, name, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: "Token, email and password are required" });
    }

    const user = await User.findOne({ email, inviteToken: token, role: "admin" });
    if (!user) return res.status(400).json({ error: "Invalid invite" });

    user.name = name || user.name;
    user.passwordHash = await bcrypt.hash(password, 10);
    user.inviteToken = null;
    await user.save();

    const jwtToken = signToken(user);
    res.json({
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, age: user.age, income: user.income, gender: user.gender, state: user.state, casteCategory: user.casteCategory, occupation: user.occupation },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yojanatrack";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "admin@yourapp.com";
    const plainPassword = "Admin@12345"; // change after first login

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`ℹ️  Admin user with email ${email} already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const admin = await User.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: "admin",
    });

    console.log("✅ Admin user created:");
    console.log(`   email:    ${admin.email}`);
    console.log(`   password: ${plainPassword}`);
    console.log("   (Please change this password after first login.)");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();


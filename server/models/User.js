const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Optional profile fields for matching
    age: { type: Number },
    income: { type: Number },
    gender: { type: String },
    state: { type: String },
    casteCategory: { type: String },
    occupation: { type: String },
    // Admin invite flow
    inviteToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);

const nodemailer = require("nodemailer");
const Scheme     = require("../models/Scheme");
const User       = require("../models/User");

// ─────────────────────────────────────────────
// Email transporter (uses Gmail — swap for
// SendGrid / Mailgun in production)
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,     // use App Password, not real password
  },
});

// ─────────────────────────────────────────────
// Check if a user is eligible for a scheme
// (same logic as frontend — single source of truth)
// ─────────────────────────────────────────────
const isEligible = (user, scheme) => {
  const c = scheme.eligibilityCriteria;
  if (!c) return true;    // no criteria = open to all

  if (c.minAge    && user.age    < c.minAge)    return false;
  if (c.maxAge    && user.age    > c.maxAge)    return false;
  if (c.maxIncome && user.income > c.maxIncome) return false;

  if (c.gender && c.gender !== "any" && c.gender !== user.gender)
    return false;

  if (c.states?.length && !c.states.includes(user.state))
    return false;

  if (c.casteCategory?.length && !c.casteCategory.includes(user.casteCategory))
    return false;

  if (c.occupation?.length && !c.occupation.includes(user.occupation))
    return false;

  return true;
};

// ─────────────────────────────────────────────
// Build the HTML email body
// ─────────────────────────────────────────────
const buildEmailHTML = (userName, schemes) => {
  const schemeList = schemes
    .map(
      (s) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0">
          <strong style="color:#1a1a2e">${s.name}</strong><br/>
          <span style="color:#64748b;font-size:13px">${s.description.slice(0, 120)}...</span><br/>
          <span style="color:#2563eb;font-size:13px;font-weight:600">Benefit: ${s.benefit}</span>
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 28px;text-align:center">
      <h1 style="color:#fff;font-size:24px;margin:0">🇮🇳 YojanaTrack</h1>
      <p style="color:#94a3b8;font-size:14px;margin:8px 0 0">New schemes matched for you</p>
    </div>
    <div style="padding:28px">
      <p style="color:#1a1a2e;font-size:16px">Hi <strong>${userName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6">
        We found <strong>${schemes.length} new government scheme${schemes.length > 1 ? "s" : ""}</strong>
        that match your profile. Don't miss out on benefits you're entitled to!
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        ${schemeList}
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="${process.env.APP_URL || "http://localhost:5173"}/dashboard"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          View on YojanaTrack →
        </a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8">
      You're receiving this because you have notifications enabled on YojanaTrack.<br/>
      <a href="${process.env.APP_URL}/unsubscribe" style="color:#64748b">Unsubscribe</a>
    </div>
  </div>`;
};

// ─────────────────────────────────────────────
// Main function: called after every scrape run
// Finds newly added schemes → matches with users
// → sends email to each matched user
// ─────────────────────────────────────────────
const notifyMatchingUsers = async (newSchemes = []) => {
  if (newSchemes.length === 0) {
    console.log("  No new schemes — skipping notifications");
    return;
  }

  console.log(`\n[Notifier] Checking ${newSchemes.length} new schemes against all users...`);

  // Fetch all users who have notifications enabled
  const users = await User.find({ notificationsEnabled: true, email: { $exists: true, $ne: "" } });
  console.log(`  Found ${users.length} users with notifications on`);

  let emailsSent = 0;

  for (const user of users) {
    // Which of the new schemes is this user eligible for?
    const matchedForUser = newSchemes.filter((s) => isEligible(user, s));

    if (matchedForUser.length === 0) continue;

    console.log(`  Sending email to ${user.email} (${matchedForUser.length} matches)`);

    try {
      await transporter.sendMail({
        from:    `"YojanaTrack" <${process.env.EMAIL_USER}>`,
        to:      user.email,
        subject: `🎉 ${matchedForUser.length} new scheme${matchedForUser.length > 1 ? "s" : ""} matched for you!`,
        html:    buildEmailHTML(user.name, matchedForUser),
      });
      emailsSent++;
    } catch (err) {
      console.error(`  Failed to send email to ${user.email}:`, err.message);
    }

    // Small delay to avoid hitting email rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  // Mark all new schemes as notified
  await Scheme.updateMany(
    { _id: { $in: newSchemes.map((s) => s._id) } },
    { $set: { pendingNotification: false } }
  );

  console.log(`[Notifier] Done. Sent ${emailsSent} emails.\n`);
  return emailsSent;
};

module.exports = { notifyMatchingUsers, isEligible };

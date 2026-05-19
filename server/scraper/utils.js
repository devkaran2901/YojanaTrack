const axios   = require("axios");
const cheerio = require("cheerio");

// ─────────────────────────────────────────────
// Generic page fetcher with retry logic
// ─────────────────────────────────────────────
const fetchPage = async (url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          // Mimic a real browser so sites don't block Node requests
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 15000,       // 15s timeout per request
      });
      return data;
    } catch (err) {
      console.warn(`  Attempt ${attempt} failed for ${url}: ${err.message}`);
      if (attempt === retries) throw err;
      // Wait 2s before retrying
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

// ─────────────────────────────────────────────
// Map raw category text → our standard categories
// ─────────────────────────────────────────────
const normaliseCategory = (raw = "") => {
  const text = raw.toLowerCase();
  if (text.includes("agri") || text.includes("farm") || text.includes("kisan"))
    return "Agriculture";
  if (text.includes("edu") || text.includes("scholar") || text.includes("student"))
    return "Education";
  if (text.includes("health") || text.includes("medical") || text.includes("ayush"))
    return "Health";
  if (text.includes("hous") || text.includes("awas") || text.includes("shelter"))
    return "Housing";
  if (text.includes("business") || text.includes("entrepre") || text.includes("startup") || text.includes("msme"))
    return "Business";
  if (text.includes("women") || text.includes("mahila") || text.includes("beti"))
    return "Women";
  if (text.includes("welfare") || text.includes("social") || text.includes("pension"))
    return "Welfare";
  return "Other";
};

// ─────────────────────────────────────────────
// Extract income number from messy strings
// e.g. "₹2.5 lakh", "Rs. 200000", "2,50,000"
// ─────────────────────────────────────────────
const parseIncome = (text = "") => {
  if (!text) return null;
  const lower = text.toLowerCase().replace(/,/g, "");

  // Handle "X lakh" format
  const lakhMatch = lower.match(/([\d.]+)\s*lakh/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);

  // Handle plain number
  const numMatch = lower.match(/[\d]+/);
  if (numMatch) return parseInt(numMatch[0]);

  return null;
};

// ─────────────────────────────────────────────
// Extract age range from eligibility text
// e.g. "18 to 60 years", "above 18 years"
// ─────────────────────────────────────────────
const parseAge = (text = "") => {
  const lower = text.toLowerCase();
  let minAge = null;
  let maxAge = null;

  const rangeMatch = lower.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years?/);
  if (rangeMatch) {
    minAge = parseInt(rangeMatch[1]);
    maxAge = parseInt(rangeMatch[2]);
    return { minAge, maxAge };
  }

  const aboveMatch = lower.match(/(?:above|more than|minimum|at least)\s*(\d+)\s*years?/);
  if (aboveMatch) minAge = parseInt(aboveMatch[1]);

  const belowMatch = lower.match(/(?:below|less than|maximum|up to|upto)\s*(\d+)\s*years?/);
  if (belowMatch) maxAge = parseInt(belowMatch[1]);

  return { minAge, maxAge };
};

// ─────────────────────────────────────────────
// Detect gender from eligibility text
// ─────────────────────────────────────────────
const parseGender = (text = "") => {
  const lower = text.toLowerCase();
  if (lower.includes("only women") || lower.includes("women only") || lower.includes("female"))
    return "female";
  if (lower.includes("only men") || lower.includes("male only"))
    return "male";
  return "any";
};

// ─────────────────────────────────────────────
// Detect caste categories from eligibility text
// ─────────────────────────────────────────────
const parseCaste = (text = "") => {
  const categories = [];
  const lower = text.toLowerCase();
  if (lower.includes(" sc") || lower.includes("scheduled caste"))  categories.push("SC");
  if (lower.includes(" st") || lower.includes("scheduled tribe"))  categories.push("ST");
  if (lower.includes("obc") || lower.includes("other backward"))   categories.push("OBC");
  if (lower.includes("general") || lower.includes("unreserved"))   categories.push("general");
  return categories;
};

// ─────────────────────────────────────────────
// Detect occupation keywords
// ─────────────────────────────────────────────
const parseOccupation = (text = "") => {
  const lower = text.toLowerCase();
  const occupations = [];
  if (lower.includes("farmer") || lower.includes("agricultur") || lower.includes("kisan"))
    occupations.push("farmer");
  if (lower.includes("student") || lower.includes("scholar"))
    occupations.push("student");
  if (lower.includes("entrepreneur") || lower.includes("startup") || lower.includes("business"))
    occupations.push("business");
  if (lower.includes("self-employ") || lower.includes("self employ"))
    occupations.push("self-employed");
  return occupations;
};

// ─────────────────────────────────────────────
// Clean raw text — strip extra spaces and newlines
// ─────────────────────────────────────────────
const cleanText = (text = "") =>
  text.replace(/\s+/g, " ").replace(/\n/g, " ").trim();

module.exports = {
  fetchPage,
  normaliseCategory,
  parseIncome,
  parseAge,
  parseGender,
  parseCaste,
  parseOccupation,
  cleanText,
};

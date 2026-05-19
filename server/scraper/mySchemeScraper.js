const cheerio = require("cheerio");
const {
  fetchPage,
  normaliseCategory,
  parseIncome,
  parseAge,
  parseGender,
  parseCaste,
  parseOccupation,
  cleanText,
} = require("./utils");

const BASE_URL = "https://www.myscheme.gov.in";

// ─────────────────────────────────────────────
// Step 1: Get all scheme listing page URLs
// myScheme now exposes schemes primarily via the
// search endpoint. We approximate pagination by
// iterating a fixed set of category URLs.
// ─────────────────────────────────────────────
// We don't have a stable public API, so we:
//   1. Hit a handful of popular category URLs.
//   2. Extract any links that look like /scheme/<slug>.
const CATEGORY_PATHS = [
  "/search",                       // generic search page
  "/search/category/Social%20Welfare%20%26%20Empowerment",
  "/search/category/Agriculture",
  "/search/category/Education",
  "/search/category/Health",
];

const getSchemeLinks = async () => {
  const links = new Set();

  console.log("  Fetching scheme links from myscheme.gov.in...");

  for (const path of CATEGORY_PATHS) {
    const url = `${BASE_URL}${path}`;
    try {
      const html = await fetchPage(url);
      const $    = cheerio.load(html);

      // myScheme detail pages usually look like /scheme/<slug>
      $("a[href*='/scheme/']").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (!href) return;

        // Normalise to absolute URL
        const full =
          href.startsWith("http") ? href :
          href.startsWith("/")    ? BASE_URL + href :
          `${BASE_URL}/${href}`;

        if (full.includes("/scheme/")) {
          links.add(full);
        }
      });

      console.log(`    ${path}: total links so far ${links.size}`);

      // Polite delay — don't hammer the server
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`    Failed to fetch ${url}:`, err.message);
    }
  }

  return Array.from(links);
};

// ─────────────────────────────────────────────
// Step 2: Scrape a single scheme detail page
// ─────────────────────────────────────────────
const scrapeSchemeDetail = async (url) => {
  try {
    const html = await fetchPage(url);
    const $    = cheerio.load(html);

    // ── Basic info ──────────────────────────
    const name = cleanText(
      $("h1").first().text() ||
      $(".scheme-title").first().text() ||
      $("title").text().split("|")[0]
    );

    if (!name || name.length < 4) return null;

    const description = cleanText(
      $(".scheme-description, .scheme-overview, .description, [class*='overview']")
        .first().text() ||
      $("p").first().text()
    );

    const rawCategory = cleanText(
      $(".scheme-category, .category, [class*='category']").first().text()
    );

    const benefit = cleanText(
      $(".benefit, .scheme-benefit, [class*='benefit']").first().text() ||
      "Check official site"
    );

    const ministry = cleanText(
      $(".ministry, .nodal-ministry, [class*='ministry']").first().text()
    );

    // ── Eligibility section ──────────────────
    // Most government sites have an "Eligibility" heading followed by a list
    let eligibilityText = "";
    $("h2, h3, h4, strong").each((i, el) => {
      const heading = $(el).text().toLowerCase();
      if (heading.includes("eligib")) {
        // Grab the next sibling's text
        eligibilityText += $(el).next().text() + " ";
        // Also grab the parent section text
        eligibilityText += $(el).parent().text() + " ";
      }
    });

    // ── Documents section ────────────────────
    const documents = [];
    $("h2, h3, h4, strong").each((i, el) => {
      const heading = $(el).text().toLowerCase();
      if (heading.includes("document") || heading.includes("required")) {
        $(el).nextAll("ul, ol").first().find("li").each((j, li) => {
          const doc = cleanText($(li).text());
          if (doc.length > 2) documents.push(doc);
        });
      }
    });

    // ── Parse eligibility into structured data ──
    const { minAge, maxAge } = parseAge(eligibilityText);

    return {
      name,
      description: description.slice(0, 500),
      category:    normaliseCategory(rawCategory || description),
      benefit:     benefit.slice(0, 200),
      deadline:    "Ongoing",
      sourceUrl:   url,
      ministry,
      eligibilityCriteria: {
        minAge:        minAge,
        maxAge:        maxAge,
        maxIncome:     parseIncome(eligibilityText),
        gender:        parseGender(eligibilityText),
        states:        [],    // hard to extract reliably — left for manual review
        casteCategory: parseCaste(eligibilityText),
        occupation:    parseOccupation(eligibilityText + " " + description),
      },
      documents: documents.slice(0, 10),
      scrapedAt: new Date(),
    };
  } catch (err) {
    console.error(`    Failed to scrape ${url}:`, err.message);
    return null;
  }
};

// ─────────────────────────────────────────────
// Main export: scrape myscheme.gov.in
// ─────────────────────────────────────────────
const scrapeMyScheme = async () => {
  console.log("\n[MySchemeScraper] Starting...");
  const startTime = Date.now();

  const links = await getSchemeLinks();
  console.log(`  Total scheme links found: ${links.length}`);

  const schemes = [];

  for (let i = 0; i < links.length; i++) {
    console.log(`  Scraping ${i + 1}/${links.length}: ${links[i]}`);
    const scheme = await scrapeSchemeDetail(links[i]);
    if (scheme) schemes.push(scheme);

    // Polite delay between detail page requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`[MySchemeScraper] Done. Scraped ${schemes.length} schemes in ${Date.now() - startTime}ms\n`);
  return schemes;
};

module.exports = scrapeMyScheme;

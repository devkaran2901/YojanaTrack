const cheerio = require("cheerio");
const {
  fetchPage,
  normaliseCategory,
  parseAge,
  parseGender,
  parseCaste,
  parseOccupation,
  cleanText,
} = require("./utils");

const BASE_URL = "https://vikaspedia.in";

// Vikaspedia is an Indian government knowledge portal.
// Their structure changes occasionally, so we:
//   1. Hit a set of known scheme-related pages.
//   2. Look for common card/article patterns AND generic links
//      that contain "scheme" in the URL.
const SCHEME_PAGES = [
  "/social-welfare/welfare-schemes-1",
  "/education/policies-and-schemes",
  "/agriculture/agri-policy-and-schemes",
  "/health/health-policies-and-programmes",
];

const scrapeVikaspedia = async () => {
  console.log("\n[VikaspediaScraper] Starting...");
  const startTime = Date.now();
  const schemes = [];

  for (const path of SCHEME_PAGES) {
    try {
      console.log(`  Fetching ${BASE_URL + path}`);
      const html = await fetchPage(BASE_URL + path);
      const $    = cheerio.load(html);

      // Vikaspedia scheme cards / sections – try multiple patterns.
      // 1) Obvious content containers (articles, cards, etc.)
      $(".content-box, article, .scheme-item, .card, .listing-item").each((i, el) => {
        const name = cleanText($(el).find("h1, h2, h3, h4, .title").first().text());
        if (!name || name.length < 4) return;

        const description = cleanText($(el).find("p").first().text());
        const linkEl      = $(el).find("a").first();
        const href        = linkEl.attr("href") || "";
        const sourceUrl   = href.startsWith("http") ? href : BASE_URL + href;

        const fullText    = cleanText($(el).text());
        const { minAge, maxAge } = parseAge(fullText);

        schemes.push({
          name,
          description: description.slice(0, 500),
          category:    normaliseCategory(path + " " + description),
          benefit:     "Check official site",
          deadline:    "Ongoing",
          sourceUrl,
          ministry:    "",
          eligibilityCriteria: {
            minAge,
            maxAge,
            maxIncome:     null,
            gender:        parseGender(fullText),
            states:        [],
            casteCategory: parseCaste(fullText),
            occupation:    parseOccupation(fullText),
          },
          documents: [],
          scrapedAt: new Date(),
        });
      });

      // 2) Fallback: any anchor that clearly looks like a scheme link.
      $("a[href*='scheme']").each((i, el) => {
        const name = cleanText($(el).text());
        const href = $(el).attr("href") || "";
        if (!name || name.length < 4 || !href) return;

        const sourceUrl = href.startsWith("http") ? href : BASE_URL + href;
        const context   = cleanText($(el).closest("li, p, div, article").text());
        const { minAge, maxAge } = parseAge(context);

        schemes.push({
          name,
          description: context.slice(0, 500),
          category:    normaliseCategory(path + " " + context),
          benefit:     "Check official site",
          deadline:    "Ongoing",
          sourceUrl,
          ministry:    "",
          eligibilityCriteria: {
            minAge,
            maxAge,
            maxIncome:     null,
            gender:        parseGender(context),
            states:        [],
            casteCategory: parseCaste(context),
            occupation:    parseOccupation(context),
          },
          documents: [],
          scrapedAt: new Date(),
        });
      });

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  Failed ${path}:`, err.message);
    }
  }

  console.log(`[VikaspediaScraper] Done. Scraped ${schemes.length} schemes in ${Date.now() - startTime}ms\n`);
  return schemes;
};

module.exports = scrapeVikaspedia;

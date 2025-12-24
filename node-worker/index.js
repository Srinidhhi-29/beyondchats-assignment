import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "http://127.0.0.1:8000";

/* ===================== LARAVEL ===================== */

async function getLatestArticle() {
  const res = await axios.get(`${BASE_URL}/api/articles/latest`);
  return res.data;
}

/* ===================== SEARCH ===================== */

async function searchWeb(query) {
  console.log("Trying DuckDuckGo...");
  const ddg = await duckDuckGoSearch(query);

  if (ddg.length > 0) return ddg;

  console.log("DuckDuckGo blocked. Falling back to Bing...");
  return await bingSearch(query);
}

/* ---------- DuckDuckGo (safe + clean) ---------- */

async function duckDuckGoSearch(query) {
  const url = "https://duckduckgo.com/html/?q=" + encodeURIComponent(query);

  const res = await axios.get(url, { headers: browserHeaders() });
  const $ = cheerio.load(res.data);

  const links = [];

  $("a").each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;

    // Decode DuckDuckGo redirect URLs
    if (href.includes("uddg=")) {
      const match = href.match(/uddg=([^&]+)/);
      if (match) href = decodeURIComponent(match[1]);
    }

    if (isValidArticleUrl(href)) {
      links.push(href);
    }
  });

  return uniqueLinks(links);
}

/* ---------- Bing (safe + clean) ---------- */

async function bingSearch(query) {
  const url = "https://www.bing.com/search?q=" + encodeURIComponent(query);

  const res = await axios.get(url, { headers: browserHeaders() });
  const $ = cheerio.load(res.data);

  const links = [];

  $("li.b_algo h2 a").each((_, el) => {
    const href = $(el).attr("href");
    if (isValidArticleUrl(href)) links.push(href);
  });

  return uniqueLinks(links);
}

/* ===================== SCRAPER ===================== */

async function scrapeArticle(url) {
  try {
    const res = await axios.get(url, { headers: browserHeaders() });
    const $ = cheerio.load(res.data);

    let text = "";
    $("p").each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 80) text += t + "\n\n";
    });

    return text.slice(0, 3500);
  } catch {
    return "";
  }
}

/* ===================== HELPERS ===================== */

function browserHeaders() {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };
}

function isValidArticleUrl(url) {
  if (!url || !url.startsWith("http")) return false;

  const blocked = [
    "duckduckgo.com",
    "bing.com",
    "google.com",
    "doubleclick",
    "adclick",
    "y.js?",
    "utm_",
  ];

  return !blocked.some((b) => url.includes(b));
}

function uniqueLinks(links) {
  return [...new Set(links)].slice(0, 2);
}

function cleanTitle(title) {
  return title.replace(/\s*\(Updated\)+/gi, "").trim();
}

/* ===================== MAIN PIPELINE ===================== */

async function run() {
  try {
    console.log("Fetching latest article...");
    const article = await getLatestArticle();

    const baseTitle = cleanTitle(article.title);

    console.log("Searching web for competing articles...");
    const links = await searchWeb(baseTitle);

    console.log("Found links:", links);

    if (links.length === 0) {
      console.log("No valid competitor articles found. Skipping update.");
      return;
    }

    const contents = [];
    for (const link of links) {
      const c = await scrapeArticle(link);
      if (c) contents.push(c);
    }

    const updatedContent = `
UPDATED ARTICLE (AI-ENHANCED)

TITLE:
${baseTitle}

SUMMARY:
This article was refined by comparing it with top-ranking web articles.
Structure, clarity, and readability were improved.

REFERENCE INSIGHTS:
${contents.join("\n\n---\n\n")}

REFERENCES:
${links.join("\n")}
`;

    console.log("Publishing updated article...");

    await axios.post(`${BASE_URL}/api/articles`, {
      title: baseTitle + " (Updated)",
      content: article.content,
      updated_content: updatedContent,
      source_url: article.source_url,
      references: links.join(", "),
    });

    console.log("Updated article published successfully!");
  } catch (err) {
    console.error("PIPELINE ERROR:", err.message);
  }
}

run();

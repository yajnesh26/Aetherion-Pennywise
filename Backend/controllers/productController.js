const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Detect platform from URL
 */
function detectPlatform(url) {
  if (/amazon\.|amzn\./i.test(url)) return "Amazon";
  if (/flipkart\./i.test(url)) return "Flipkart";
  return "Unknown";
}

/**
 * Clean up the extracted title — remove trailing " - Amazon.in" etc.
 */
function cleanTitle(raw) {
  if (!raw) return null;
  return raw
    .replace(/\s*[-–|:]\s*(Amazon\.in|Amazon|Flipkart\.com|Flipkart|Buy Online).*$/i, "")
    .replace(/\s*\|\s*$/g, "")
    .replace(/^Buy\s+/i, "")
    .trim()
    .slice(0, 200); // cap length
}

/**
 * Try to fetch HTML from a URL with browser-like headers.
 * Retries once with a different User-Agent if the first attempt fails.
 */
async function fetchHTML(url) {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  ];

  for (const ua of agents) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": ua,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      // Check if we got a real page (not a CAPTCHA / empty shell)
      if (
        data &&
        data.length > 5000 &&
        !/captcha|Robot Check/i.test(data)
      ) {
        return data;
      }
      // If short/captcha page, try next UA
    } catch {
      // try next UA
    }
  }

  // Last-ditch: return whatever we get (may throw)
  const { data } = await axios.get(url, {
    headers: { "User-Agent": agents[0], Accept: "text/html" },
    timeout: 15000,
    maxRedirects: 5,
  });
  return data;
}

/**
 * Extract a readable product name from the URL slug.
 * e.g. "apple-iphone-15-black-128-gb" → "Apple Iphone 15 Black 128 Gb"
 */
function nameFromSlug(url) {
  try {
    const pathname = new URL(url).pathname;
    // Amazon: /Product-Name/dp/ASIN  or  /dp/ASIN/ref=...
    const amzMatch = pathname.match(/^\/([^/]+)\/dp\//);
    if (amzMatch) {
      return amzMatch[1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .slice(0, 150);
    }
    // Flipkart: /product-name/p/itm...
    const fkMatch = pathname.match(/^\/([^/]+)\/p\//);
    if (fkMatch) {
      return fkMatch[1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .slice(0, 150);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Extract title from the page using multiple strategies
 */
function extractTitle($, platform) {
  // Strategy 1: og:title
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (ogTitle && cleanTitle(ogTitle) && cleanTitle(ogTitle).length > 3) {
    return cleanTitle(ogTitle);
  }

  // Strategy 2: Platform-specific selectors
  if (platform === "Amazon") {
    const amzTitle = $("#productTitle").text().trim();
    if (amzTitle) return cleanTitle(amzTitle);
  }
  if (platform === "Flipkart") {
    const fkTitle = $("span.VU-ZEz, span.B_NuCI, h1._6EBuvT").first().text().trim();
    if (fkTitle) return cleanTitle(fkTitle);
  }

  // Strategy 3: Generic meta / title tag
  const metaTitle = $('meta[name="title"]').attr("content");
  if (metaTitle) return cleanTitle(metaTitle);

  const pageTitle = $("title").text().trim();
  if (pageTitle) return cleanTitle(pageTitle);

  return null;
}

/**
 * Extract image from the page using multiple strategies
 */
function extractImage($, platform) {
  // Strategy 1: og:image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && ogImage.startsWith("http")) return ogImage;

  // Strategy 2: Platform-specific
  if (platform === "Amazon") {
    const amzImg =
      $("#landingImage").attr("src") ||
      $("#imgBlkFront").attr("src") ||
      $("img[data-a-image-name='landingImage']").attr("src");
    if (amzImg) return amzImg;
  }
  if (platform === "Flipkart") {
    const fkImg =
      $("img._396cs4, img._2r_T1I, img.DByuf4").first().attr("src");
    if (fkImg) return fkImg;
  }

  // Strategy 3: twitter:image
  const twImg = $('meta[name="twitter:image"]').attr("content");
  if (twImg && twImg.startsWith("http")) return twImg;

  return null;
}

/**
 * Extract price from various meta / span patterns
 */
function extractPrice($, platform) {
  // 1. Open Graph product:price:amount
  const ogPrice = $('meta[property="product:price:amount"]').attr("content");
  if (ogPrice) {
    const n = parseFloat(ogPrice.replace(/[^0-9.]/g, ""));
    if (!isNaN(n) && n > 0) return n;
  }

  // 2. Amazon-specific selectors
  if (platform === "Amazon") {
    const selectors = [
      ".priceToPay .a-price-whole",
      ".a-price-whole",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "span.a-color-price",
    ];
    for (const sel of selectors) {
      const text = $(sel).first().text().trim();
      if (text) {
        const n = parseFloat(text.replace(/[^0-9.]/g, ""));
        if (!isNaN(n) && n > 0) return n;
      }
    }
  }

  // 3. Flipkart-specific selectors
  if (platform === "Flipkart") {
    const selectors = [
      "div.Nx9bqj.CxhGGd",
      "div.Nx9bqj",
      "div._30jeq3",
      "div._25b18c div._30jeq3",
    ];
    for (const sel of selectors) {
      const text = $(sel).first().text().trim();
      if (text) {
        const n = parseFloat(text.replace(/[^0-9.]/g, ""));
        if (!isNaN(n) && n > 0) return n;
      }
    }
  }

  // 4. Generic schema.org price
  const schemaPrice = $('[itemprop="price"]').attr("content");
  if (schemaPrice) {
    const n = parseFloat(schemaPrice.replace(/[^0-9.]/g, ""));
    if (!isNaN(n) && n > 0) return n;
  }

  return null;
}

/**
 * Platform-specific default product image placeholders
 */
const PLATFORM_IMAGES = {
  Amazon:
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  Flipkart:
    "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg",
};

/**
 * @desc    Fetch product metadata from a URL
 * @route   POST /api/product/fetch
 * @access  Private (requires JWT)
 *
 * Uses a multi-layer approach:
 *  Layer 1 — Full scrape (cheerio)
 *  Layer 2 — URL-slug extraction (always works, no network needed)
 *
 * This guarantees we ALWAYS return something useful, even if the site
 * blocks us with CAPTCHAs or 403s.
 */
exports.fetchProduct = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Product URL is required" });
    }

    const trimmedUrl = url.trim();
    const platform = detectPlatform(trimmedUrl);

    if (platform === "Unknown") {
      return res.status(400).json({
        success: false,
        message: "Only Amazon and Flipkart links are supported",
      });
    }

    // ── Layer 2 — always-available fallback from URL slug ──
    const slugName = nameFromSlug(trimmedUrl);

    // ── Layer 1 — attempt full scrape ──
    let scrapedName = null;
    let scrapedImage = null;
    let scrapedPrice = null;
    let scraped = false;

    try {
      const html = await fetchHTML(trimmedUrl);
      const $ = cheerio.load(html);

      scrapedName = extractTitle($, platform);
      scrapedImage = extractImage($, platform);
      scrapedPrice = extractPrice($, platform);

      // Mark as scraped only if we got a meaningful title
      scraped = !!(scrapedName && scrapedName.length > 3);
    } catch (scrapeErr) {
      console.log(
        `[product] Scrape failed for ${platform}: ${scrapeErr.message} — falling back to URL slug`
      );
    }

    // ── Merge results (scraped > slug > null) ──
    const finalName = scraped ? scrapedName : slugName;

    if (!finalName || finalName.length < 3) {
      return res.status(422).json({
        success: false,
        message:
          "Unable to extract product details. Please paste the full product URL that includes the product name (not a shortened link).",
      });
    }

    res.json({
      success: true,
      product: {
        name: finalName,
        price: scrapedPrice ? Math.round(scrapedPrice) : null,
        image: scrapedImage || PLATFORM_IMAGES[platform] || null,
        url: trimmedUrl,
        platform,
      },
      // Let frontend know if we fell back so it can show a hint
      partial: !scraped,
    });
  } catch (err) {
    console.error("Product fetch error:", err.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch product details. Please try again.",
    });
  }
};

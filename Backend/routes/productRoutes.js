const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { fetchProduct } = require("../controllers/productController");
const { createRateLimiter } = require("../middleware/rateLimit");

// SEC-03 — rate limiting for resource-intensive endpoint.
const productLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 30 });

// POST /api/product/fetch �?" scrape product info from a URL
router.post("/fetch", productLimiter, protect, fetchProduct);

module.exports = router;

const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimit");

// SEC-03 — rate limiting for resource-intensive endpoint.
const aiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

// POST /api/ai/ask �?" ask the AI assistant
// All AI routes require authentication
router.post("/ask", aiLimiter, protect, askAI);

module.exports = router;
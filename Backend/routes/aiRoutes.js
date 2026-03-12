const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/aiController");

// POST /api/ai/ask — ask the Gemini-powered AI assistant
// NOTE: This endpoint is public to allow quick access to the assistant without forcing login.
// The controller itself uses a fallback when Gemini is not configured.
router.post("/ask", askAI);

module.exports = router;

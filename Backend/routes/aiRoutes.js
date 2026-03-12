const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/ai/ask — ask the Gemini-powered AI assistant
router.post("/ask", protect, askAI);

module.exports = router;

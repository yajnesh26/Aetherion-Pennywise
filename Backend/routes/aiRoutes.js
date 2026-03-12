const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/aiController");


// POST /api/ai/ask — ask the AI assistant
// All AI routes require authentication
router.post("/ask", protect, askAI);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/aiService');

router.post('/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await getChatResponse(message, history);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to fetch response from AI",
            details: error.message 
        });
    }
});

module.exports = router;

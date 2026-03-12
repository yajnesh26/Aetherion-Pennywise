const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = "https://api.groq.com/openai/v1";

const SYSTEM_PROMPT = `
You are PennyWise AI, a smart financial assistant for the PennyWise app.
Your goal is to help users manage their money, save better, and understand micro-investments.

Guidelines:
1. Be encouraging, professional, and helpful.
2. Focus on savings, budgeting, and micro-investing (e.g., SIPs, Digital Gold, Liquid Funds).
3. Explain that PennyWise helps users save by rounding up their transactions to the nearest ₹10.
4. Keep responses concise and use markdown formatting for readability.
5. Do not provide high-risk financial advice or specific stock picks.
`;

const getChatResponse = async (userMessage, chatHistory = []) => {
    if (!GROQ_API_KEY) {
        throw new Error("Groq API key is not configured on the server.");
    }

    try {
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory,
            { role: "user", content: userMessage },
        ];

        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { getChatResponse };

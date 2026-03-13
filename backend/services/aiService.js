const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = "https://api.groq.com/openai/v1";

const SYSTEM_PROMPT = `
You are PennyWise AI, a smart financial assistant for the PennyWise app.
Your goal is to help users manage their money, save better, and understand micro-investments.

Guidelines:
1. Provide personalized financial insights based on the user's goals, savings, and spending patterns provided in the context.
2. Be encouraging, professional, and helpful.
3. Focus on savings, budgeting, and micro-investing (e.g., SIPs, Digital Gold, Liquid Funds).
4. If asked about the app, explain that PennyWise helps users save by rounding up their transactions to the nearest ₹10.
5. Keep responses concise and use markdown formatting (bolding, lists) for readability.
6. Do not provide high-risk financial advice or specific stock picks. Stick to general investment concepts and safe options like Index Funds or Government Bonds.
`;

const { analyzeSpending } = require('./spendingAnalyzer');
const { buildFinancialSummary } = require('./financialCoachService');

/**
 * Builds a readable text summary of the user's financial status.
 */
const buildUserContextSummary = (context) => {
    if (!context) return "";
    
    const { bankBalance, walletSavings, goals, transactions } = context;
    const user = { bankBalance, walletSavings };
    
    return buildFinancialSummary(user, goals, transactions);
};

const getChatResponse = async (userMessage, chatHistory = [], userContext = null) => {
    if (!GROQ_API_KEY) {
        throw new Error("Groq API key is not configured on the server.");
    }

    try {
        const userContextSummary = buildUserContextSummary(userContext);
        
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory
        ];

        // Inject data summary as a system message before the user message if available
        if (userContextSummary) {
            messages.push({ role: "system", content: `Context for this user: ${userContextSummary}` });
        }

        messages.push({ role: "user", content: userMessage });

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

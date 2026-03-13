/**
 * Service to provide comprehensive financial coaching insights.
 */
const { analyzeSpending } = require('./spendingAnalyzer');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Calculates a financial health score (0-100).
 */
const calculateFinancialHealthScore = (user, goals, transactions) => {
    let score = 50; // Starting baseline

    // 1. Savings Ratio (Wallet Savings vs Transactions)
    const walletSavings = Number(user.walletSavings) || 0;
    const totalSpent = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    
    if (totalSpent > 0) {
        const ratio = (walletSavings / totalSpent) * 100;
        if (ratio > 10) score += 15;
        else if (ratio > 5) score += 10;
        else if (ratio > 2) score += 5;
    }

    // 2. Goal Progress
    if (goals && goals.length > 0) {
        const averageProgress = goals.reduce((sum, g) => sum + (Number(g.saved || 0) / Number(g.target || 1)), 0) / goals.length;
        score += Math.floor(averageProgress * 20);
        
        const achievedCount = goals.filter(g => Number(g.saved || 0) >= Number(g.target || 999999)).length;
        if (achievedCount > 0) score += 5;
    }

    // 3. Transaction Activity (consistency)
    if (transactions.length > 10) score += 10;
    else if (transactions.length > 0) score += 5;

    // 4. Overspending check
    const analysis = analyzeSpending(transactions);
    const overspending = analysis.insights.filter(i => i.includes('%')).length;
    score -= (overspending * 10);

    return Math.min(100, Math.max(0, score));
};

/**
 * Builds a readable text summary for AI.
 */
const buildFinancialSummary = (user, goals, transactions) => {
    const analysis = analyzeSpending(transactions);
    const score = calculateFinancialHealthScore(user, goals, transactions);

    let summary = `Financial Status Summary:\n`;
    summary += `- Health Score: ${score}/100\n`;
    summary += `- Bank Balance: ₹${user.bankBalance || 0}\n`;
    summary += `- Total Savings: ₹${user.walletSavings || 0}\n`;
    
    summary += `\nGoals:\n`;
    goals.forEach(g => {
        summary += `- ${g.name}: ₹${g.saved || 0} saved of ₹${g.target} target\n`;
    });

    summary += `\nSpending Breakdown:\n`;
    summary += `- Total Spending: ₹${analysis.totalSpending}\n`;
    if (analysis.categoryPercentages) {
        Object.entries(analysis.categoryPercentages).forEach(([cat, pct]) => {
            summary += `- ${cat}: ${pct}%\n`;
        });
    }

    return summary;
};

/**
 * Generates AI coaching insights.
 */
const generateCoachInsights = async (user, goals, transactions) => {
    const score = calculateFinancialHealthScore(user, goals, transactions);
    const summary = buildFinancialSummary(user, goals, transactions);
    const analysis = analyzeSpending(transactions);

    if (!GROQ_API_KEY) {
        return {
            score,
            insights: analysis.insights,
            advice: "AI advice unavailable (API key missing)."
        };
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an expert financial coach. Look at the data provided and give 3 short, actionable, and personalized pieces of advice to improve the user's financial health. Start directly with the points. Use ₹ for currency. Keep it professional but encouraging. Do not use conversational filler." 
                    },
                    { role: "user", content: `Here is the financial data: ${summary}` }
                ],
                temperature: 0.6,
                max_tokens: 500,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
            }
        );

        return {
            score,
            insights: analysis.insights,
            advice: response.data.choices[0].message.content
        };
    } catch (err) {
        console.error("Coach Insight Error:", err.message);
        return {
            score,
            insights: analysis.insights,
            advice: "Keep saving and track your food spending to improve your score!"
        };
    }
};

module.exports = {
    calculateFinancialHealthScore,
    analyzeSpendingPatterns: analyzeSpending,
    buildFinancialSummary,
    generateCoachInsights
};

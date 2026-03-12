const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Initialise Gemini client ──────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// System-level instruction that shapes every response
const SYSTEM_PROMPT = `You are PennyWise AI — a friendly, concise financial assistant for Indian college students.
Rules:
• Always answer in 2-4 short sentences max.
• Use Indian Rupee (₹) for any money amounts.
• Give practical, actionable savings tips.
• If the user asks something unrelated to personal finance or savings, politely steer them back.
• Be encouraging and use occasional emojis (🎯 💰 ✅).`;

// ── Offline fallback responses ────────────────────────────
const FALLBACK_RESPONSES = {
  save: "Here are proven ways to save money faster:\n\n1. **Round-up every transaction** — PennyWise does this automatically!\n2. **Set specific goals** — visual progress keeps you motivated.\n3. **Follow the 50/30/20 rule** — 50% needs, 30% wants, 20% savings.\n4. **Cook more at home** — save ₹3000-5000/month! 💰",
  invest: "For small amounts, consider:\n\n1. **SIP in Index Funds** — start with just ₹500/month.\n2. **Digital Gold** — buy from ₹1 onwards.\n3. **Liquid Funds** — better than savings accounts.\n4. **PPF** — safe, tax-free, long-term.\n\nStart small, stay consistent! 🎯",
  budget: "Try this simple budget framework:\n\n• **50%** → Needs (rent, food, transport)\n• **30%** → Wants (entertainment, shopping)\n• **20%** → Savings & investments\n\nTrack your spending for a week first — you'll be surprised where money goes! ✅",
  roundup: "Round-up savings work like magic! 🪄\n\nEvery time you pay ₹287, PennyWise rounds it to ₹290 and saves ₹3 automatically. Sounds tiny, but across 10+ transactions a day, it adds up to ₹1000-2000/month without even trying!",
  default: "Great question! 💡 Here are some quick tips:\n\n1. Use PennyWise round-ups on every transaction.\n2. Set a savings goal for something you really want.\n3. Automate your savings — even ₹50/day = ₹18,250/year!\n\nWant me to help with budgeting, saving, or investing? 🎯",
};

function getFallbackResponse(question) {
  const q = question.toLowerCase();
  if (q.includes("save") || q.includes("saving")) return FALLBACK_RESPONSES.save;
  if (q.includes("invest") || q.includes("sip") || q.includes("mutual")) return FALLBACK_RESPONSES.invest;
  if (q.includes("budget") || q.includes("spend") || q.includes("expense")) return FALLBACK_RESPONSES.budget;
  if (q.includes("round") || q.includes("roundup") || q.includes("round-up")) return FALLBACK_RESPONSES.roundup;
  return FALLBACK_RESPONSES.default;
}

// @route   POST /api/ai/ask
// @access  Private (requires JWT)
exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // No key configured — use fallback
      return res.json({ success: true, answer: getFallbackResponse(question) });
    }

    // Combine system prompt with user question
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser question: ${question}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const answer = response.text();

    res.json({ success: true, answer });
  } catch (err) {
    console.error("AI error:", err.message);
    // Gemini failed (quota / network) — return fallback instead of error
    const fallback = getFallbackResponse(req.body.question || "");
    res.json({ success: true, answer: fallback + "\n\n_⚡ Powered by offline mode_" });
  }
};

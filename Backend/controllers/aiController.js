const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Initialise Gemini client ──────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Initialise Groq client ──────────────────────────────
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askAI = async (req, res) => {
  const { question } = req.body;

  try {
    // Try Groq first
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are PennyWise AI, a smart financial assistant helping users with saving money, budgeting, and investing.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer = completion.choices[0].message.content;

    return res.json({
      success: true,
      answer,
    });

  } catch (error) {
    console.error("Groq error:", error);

    try {
      // Fallback to Gemini if Groq fails
      const result = await model.generateContent(question);
      const response = await result.response;
      const answer = response.text();

      return res.json({
        success: true,
        answer,
      });

    } catch (err) {
      console.error("Gemini error:", err);

      return res.status(500).json({
        success: false,
        answer: "AI service is temporarily unavailable. Please try again later.",
      });
    }
  }
};
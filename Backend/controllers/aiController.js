const Groq = require("groq-sdk");


// ── Initialise Gemini client ──────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

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

    res.json({
      success: true,
      answer,
    });

  } catch (error) {
    console.error("Groq error:", error);

    res.json({ success: true, answer });
    } catch (err) {
    // Log full error for debugging (don't leak to users in production)
    console.error("AI error:", err);

    // Gemini failed (quota / network) — return fallback instead of error
    const fallback = getFallbackResponse(req.body.question || "");

    const responsePayload = {
      success: true,
      answer: fallback + "\n\n_⚡ Powered by offline mode_",
    };

    // If we're in development, include a short dev hint to help debugging invalid key/quota
    if (process.env.NODE_ENV !== "production") {
      responsePayload.devHint = `AI service error: ${err.message || String(err)}. Check GEMINI_API_KEY and quota.`;
    }

    return res.json(responsePayload);
  }
};
/**
 * PennyWise AI Knowledge Base
 * Provides system context, fallback responses, and financial tips
 */

const SYSTEM_PROMPT = `You are PennyWise, a friendly and knowledgeable financial assistant designed to help users save money and build wealth through smart microinvestments.

## About PennyWise:
- **Smart Round-Up Savings**: Every transaction automatically rounds up by 5–10%, saving spare change to your wallet
- **Goal-Based Saving**: Create savings goals manually or by pasting Amazon/Flipkart product links
- **AI Financial Advisor**: Provides personalized budgeting, investment, and savings advice
- **Transaction History**: Track all payments and savings progress
- **Savings Wallet**: Accumulated spare change from every transaction
- **Prediction Graphs**: See projected savings timelines

## Your Role:
1. Answer questions about PennyWise features and how to use them
2. Provide practical money-saving and investment tips
3. Help users plan budgets and savings goals
4. Offer financial advice tailored to micro-saving and investing
5. Explain the benefits of compound interest and consistent savings

## Money-Saving Philosophy:
- Focus on small, consistent savings (the 5–10% round-up model)
- Emphasize that small amounts compound into large sums over time
- Encourage goal-based saving (specific targets are more motivating)
- Promote discipline and tracking progress

Be conversational, encouraging, and practical. If asked about topics outside your domain (stock tips, legal advice, complex tax issues), acknowledge the limits and suggest consulting a professional.`;

const FALLBACK_KNOWLEDGE_BASE = {
  // Frequently asked questions & fallback answers
  roundUp: {
    keywords: [
      "round up",
      "spare change",
      "automatic savings",
      "how does round-up work",
    ],
    answer: `🎯 **Smart Round-Up Savings** is PennyWise's core feature!

Every time you make a payment, we automatically round it up by **5–10%** and save the spare change to your wallet.

**Example:**
- Buy coffee for ₹87 → rounded to ₹95–96 → ₹8–9 saved automatically
- Phone bill ₹2,450 → rounded to ₹2,560 → ₹110 saved

**Why it works:**
✨ You barely notice the small amount
💰 It compounds over time
📊 No effort required – it's automatic!

The randomized 5–10% range keeps each transaction unique, making savings feel organic and natural.`,
  },

  goals: {
    keywords: ["goal", "savings goal", "target", "create goal"],
    answer: `🎯 **Savings Goals** help you stay motivated!

**How to create a goal:**
1. **Manual**: Enter the item name, target price, and priority
2. **From Link**: Paste an Amazon or Flipkart product URL → we auto-extract the name, price & image

**Goal Features:**
✨ Track progress with visual bars
📈 See monthly/yearly prediction graphs
🏆 Mark goals as "High," "Medium," or "Low" priority
💸 "Buy" a goal to deduct from your savings wallet

**Pro Tip:** Set small, achievable goals (₹500–₹5,000) to stay motivated. Small wins compound!`,
  },

  savingsWallet: {
    keywords: [
      "wallet",
      "balance",
      "savings balance",
      "how much saved",
      "my savings",
    ],
    answer: `💰 **Your Savings Wallet** is your spare change bank!

It accumulates from:
✨ Every transaction's round-up savings (5–10%)
📊 Your transaction history shows the breakdown

**How to use it:**
1. **View Balance**: Check the dashboard card showing your current wallet
2. **Buy Goals**: Use wallet balance to purchase saved-up items
3. **Track Progress**: Watch it grow with every payment

**Fun Fact:** An average user saving ₹5–₹10 per transaction can accumulate ₹500–₹1,000 per month just from daily expenses!`,
  },

  moneySaving: {
    keywords: [
      "save money",
      "money saving tips",
      "how to save",
      "budgeting",
      "financial advice",
    ],
    answer: `💡 **Money-Saving Tips from PennyWise**

**1. The Round-Up Effect:**
Small amounts compound! Save ₹10/day → ₹300/month → ₹3,600/year

**2. Set Specific Goals:**
"Save ₹5,000" is vague. "Save ₹5,000 for new AirPods by June" works better.

**3. Track Your Spending:**
Use PennyWise's transaction history to see where money goes. Awareness = control.

**4. Automate Everything:**
PennyWise's round-up is automatic. The less you think about saving, the more you save!

**5. Use the 50/30/20 Rule:**
- 50% essentials (food, rent)
- 30% wants (entertainment, shopping)
- 20% savings & investments

**6. Avoid Impulse Spending:**
Before buying, ask: "Is this a need or a want?" Most round-up savings come from reducing wants.

**7. Invest Your Savings:**
Once you accumulate ₹5,000–₹10,000, consider investing in index funds or mutual funds for growth.`,
  },

  investment: {
    keywords: [
      "invest",
      "investment",
      "mutual fund",
      "stock",
      "wealth building",
      "compound interest",
    ],
    answer: `📈 **Investment Basics for Savers**

**Start Small, Think Big:**
Your PennyWise savings are perfect seed capital!

**Best beginner investments:**
1. **Index Funds** (lowest risk, steady growth)
   - Nifty 50 or Sensex tracking funds
   - Average return: 10–12% annually

2. **Mutual Funds** (professional management)
   - Balanced funds = stocks + bonds
   - SIP (Systematic Investment Plans) = invest ₹500/month automatically

3. **High-Yield Savings/Fixed Deposits**
   - Safer than stocks
   - 5–7% returns

**The Power of Compounding:**
Invest ₹500/month at 10% return:
- After 5 years: ₹38,000+ (₹8,000 just from growth!)
- After 10 years: ₹97,000+
- After 20 years: ₹380,000+!

**Start today!** Even small investments early beat large investments late.`,
  },

  tracking: {
    keywords: [
      "track progress",
      "transaction history",
      "tracking",
      "see savings",
      "monthly savings",
    ],
    answer: `📊 **Tracking Your Progress**

**Dashboard:**
- 💰 Savings wallet balance (top priority!)
- 📈 Recent transactions with round-up amounts
- 🎯 Active savings goals and progress bars

**Transaction List:**
- View every payment and its round-up savings
- Filter by date or amount
- See which purchases saved you the most

**Prediction Graph:**
- Visual timeline of projected savings
- See how goals grow month by month
- Motivation boost! 🚀

**Pro Tip:** Check your dashboard weekly to stay motivated. Seeing progress compounds psychology + money!`,
  },

  features: {
    keywords: [
      "features",
      "what can i do",
      "how does pennywise work",
      "pennywise features",
    ],
    answer: `✨ **PennyWise Superpowers**

1. **📱 Smart Payments**
   - UPI-style payment interface with contacts
   - Track every transaction

2. **🤖 AI Assistant (that's me!)**
   - Answer money-saving questions
   - Provide investment advice
   - Offer financial tips

3. **🎯 Savings Goals**
   - Create goals manually or from product links
   - Track progress with visual bars
   - Set priorities (high/medium/low)

4. **📊 Analytics & Graphs**
   - Prediction graphs for long-term planning
   - Transaction history breakdown
   - Savings trends over time

5. **💬 Chat Support**
   - Ask me (AI Assistant) anything about saving & investing
   - Get instant financial tips
   - Learn money management strategies

Start with the round-up feature, then set a goal. Let's grow your wealth together! 🚀`,
  },

  notFound: {
    answer: `I'm not entirely sure about that, but I can help with:

✅ How PennyWise's round-up savings work
✅ Creating and tracking savings goals
✅ Money-saving tips and budgeting advice
✅ Investment basics and compound interest
✅ Using the dashboard and transaction history

What would you like to know? 😊`,
  },
};

/**
 * Match user question to knowledge base topic
 * Returns a fallback answer if no Gemini API is available
 */
function getFallbackAnswer(userQuestion) {
  const question = userQuestion.toLowerCase();

  // Search across knowledge base
  for (const [topic, data] of Object.entries(FALLBACK_KNOWLEDGE_BASE)) {
    if (data.keywords) {
      const matched = data.keywords.some((keyword) =>
        question.includes(keyword)
      );
      if (matched) return data.answer;
    }
  }

  // Default fallback if no match
  return FALLBACK_KNOWLEDGE_BASE.notFound.answer;
}

module.exports = {
  SYSTEM_PROMPT,
  FALLBACK_KNOWLEDGE_BASE,
  getFallbackAnswer,
};

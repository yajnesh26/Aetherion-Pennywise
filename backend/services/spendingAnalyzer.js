/**
 * Utility to analyze user spending patterns based on transaction data.
 */

const CATEGORY_KEYWORDS = {
  "Food & Dining": ["swiggy", "zomato", "restaurant", "cafe", "food", "eat", "dining", "starbucks", "burger"],
  "Shopping": ["amazon", "flipkart", "myntra", "mall", "shopping", "clothes", "shoes", "grocery", "blinkit", "zepto"],
  "Transport": ["uber", "ola", "metro", "auto", "petrol", "fuel", "rapido", "train", "flight"],
  "Bills & Utilities": ["electricity", "water", "recharge", "mobile", "wifi", "netflix", "broadband", "rent"],
  "Services": ["salon", "barber", "cleaning", "subscription", "gym", "education"],
};

/**
 * Categorizes a transaction based on its description.
 * @param {string} desc - Transaction description.
 * @returns {string} - Inferred category.
 */
const inferCategory = (desc) => {
  if (!desc) return "Others";
  const normalizedDesc = desc.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => normalizedDesc.includes(keyword))) {
      return category;
    }
  }
  
  return "Others";
};

/**
 * Analyzes transactions and returns insights.
 * @param {Array} transactions - List of transaction objects.
 * @returns {Object} - Analysis results including category totals, percentages, and insights.
 */
const analyzeSpending = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      categoryData: {},
      totalSpending: 0,
      insights: ["No transactions yet to analyze."],
    };
  }

  const categoryTotals = {};
  let totalSpending = 0;

  transactions.forEach(tx => {
    const category = tx.category || inferCategory(tx.desc);
    const amount = Number(tx.amount) || 0;
    
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    totalSpending += amount;
  });

  const insights = [];
  const categoryPercentages = {};

  if (totalSpending > 0) {
    for (const [category, total] of Object.entries(categoryTotals)) {
      const percentage = (total / totalSpending) * 100;
      categoryPercentages[category] = percentage.toFixed(1);

      if (percentage > 30) {
        insights.push(`You spent ${percentage.toFixed(0)}% of your money on ${category} recently. Consider tracking this more closely.`);
      }
    }
  }

  // General insight if no category exceeds 30%
  if (insights.length === 0 && totalSpending > 0) {
    insights.push("Your spending seems balanced across categories!");
  }

  return {
    categoryTotals,
    categoryPercentages,
    totalSpending,
    insights,
  };
};

module.exports = { analyzeSpending, inferCategory };

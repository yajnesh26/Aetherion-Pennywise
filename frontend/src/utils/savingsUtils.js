/**
 * Generates projection data for a savings goal.
 * @param {Object} goal - Goal object { saved, target, name }
 * @param {number} dailySavingRate - Average amount saved per day
 * @returns {Array} - Array of data points for Recharts
 */
export const generateProjectionData = (goal, dailySavingRate) => {
  const data = [];
  const saved = Number(goal.saved) || 0;
  const target = Number(goal.target) || 0;
  const rate = Number(dailySavingRate) || 1; // Fallback to 1 to avoid infinite loops

  // Current state
  data.push({ day: 0, savings: saved });

  const remaining = target - saved;
  if (remaining <= 0) return data;

  const daysToGoal = Math.ceil(remaining / rate);
  
  // We want to show about 7-10 data points (every week or similar)
  const interval = Math.max(1, Math.ceil(daysToGoal / 10));

  for (let i = interval; i < daysToGoal; i += interval) {
    data.push({
      day: i,
      savings: Math.floor(saved + (rate * i))
    });
  }

  // Final point
  data.push({ day: daysToGoal, savings: target });

  return data;
};

/**
 * Calculates average daily saving rate from transactions.
 * @param {Array} transactions - List of transactions
 * @returns {number} - Average daily saving rate
 */
export const calculateDailySavingRate = (transactions) => {
  if (!transactions || transactions.length === 0) return 10; // Default fallback

  const totalSaved = transactions.reduce((sum, tx) => sum + (Number(tx.roundUp) || 0), 0);
  
  // Find date range
  const dates = transactions
    .filter(tx => tx.createdAt)
    .map(tx => tx.createdAt.seconds || new Date(tx.date).getTime() / 1000)
    .sort((a, b) => a - b);

  if (dates.length < 2) return Math.max(1, totalSaved); // If just one transaction, assume it's for 1 day

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (24 * 3600)));

  return Math.max(1, totalSaved / daysDiff);
};

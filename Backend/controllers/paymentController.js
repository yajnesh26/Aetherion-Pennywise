const Transaction = require("../models/Transaction");
const User = require("../models/User");

/**
 * Smart dynamic round-up calculator.
 *
 * Logic:
 * 1. Take ~10% of transaction amount
 * 2. Add small randomness (±20%)
 * 3. Add this spare amount to the original amount
 * 4. Round to nearest friendly number (10 / 50 / 100)
 *
 * Examples:
 * ₹87   → rounded ₹100  → saved ₹13
 * ₹142  → rounded ₹160  → saved ₹18
 * ₹1263 → rounded ₹1400 → saved ₹137
 */

function calculateSmartRoundUp(amount) {

  // 1️⃣ Base spare change = 10%
  const tenPercent = amount * 0.10;

  // 2️⃣ Random variation ±20%
  const variation = tenPercent * (Math.random() * 0.4 - 0.2);

  const spareBase = tenPercent + variation;

  // 3️⃣ Temporary amount before rounding
  let tempAmount = amount + spareBase;

  let roundedAmount;

  // 4️⃣ Smart rounding rules
  if (tempAmount < 100) {
    roundedAmount = Math.ceil(tempAmount / 10) * 10;
  } 
  else if (tempAmount < 1000) {
    roundedAmount = Math.ceil(tempAmount / 50) * 50;
  } 
  else {
    roundedAmount = Math.ceil(tempAmount / 100) * 100;
  }

  // 5️⃣ Final saved amount
  let savedAmount = roundedAmount - amount;

  // Ensure minimum ₹1 saved
  savedAmount = Math.max(savedAmount, 1);

  return {
    originalAmount: amount,
    roundedAmount,
    savedAmount
  };
}


/**
 * @desc    Make a payment with smart dynamic round-up savings
 * @route   POST /api/pay
 * @access  Private
 */
const makePayment = async (req, res) => {
  try {

    const { amount, description, phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || !/^\d{10}$/.test(String(phoneNumber))) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid payment amount"
      });
    }

    const originalAmount = Number(amount);

    // Smart spare-change calculation
    const { roundedAmount, savedAmount } =
      calculateSmartRoundUp(originalAmount);

    // Create transaction (store phoneNumber)
    const transaction = await Transaction.create({
      user: req.user._id,
      phoneNumber: String(phoneNumber),
      description: description || "Payment",
      originalAmount,
      roundedAmount,
      savedAmount
    });

    // Update savings wallet
    if (savedAmount > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { savingsWallet: savedAmount } }
      );
    }

    // Fetch updated wallet
    const user = await User.findById(req.user._id);

    res.status(201).json({
      success: true,
      transaction: {
        phoneNumber: transaction.phoneNumber,
        originalAmount: transaction.originalAmount,
        roundedAmount: transaction.roundedAmount,
        savedAmount: transaction.savedAmount,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      savingsWallet: user.savingsWallet,
      message: `₹${savedAmount} spare change saved from your payment!`
    });

  } catch (error) {

    console.error("Payment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while processing payment"
    });
  }
};


/**
 * @desc    Get all transactions for the logged-in user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
  try {

    const transactions = await Transaction
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Calculate total saved
    const totalSaved = transactions.reduce(
      (sum, tx) => sum + tx.savedAmount,
      0
    );

    res.json({
      success: true,
      count: transactions.length,
      totalRoundUpSaved: totalSaved,
      transactions
    });

  } catch (error) {

    console.error("Get transactions error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching transactions"
    });
  }
};


module.exports = {
  makePayment,
  getTransactions
};
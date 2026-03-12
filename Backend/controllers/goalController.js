const Goal = require("../models/Goal");
const User = require("../models/User");

/**
 * @desc    Create a new savings goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = async (req, res) => {
  try {
    const { itemName, targetPrice, image, url } = req.body;

    if (!itemName || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: "Please provide itemName and targetPrice",
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      itemName,
      targetPrice: Number(targetPrice),
      image: image || null,
      url: url || null,
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error("Create goal error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating goal",
    });
  }
};

/**
 * @desc    Get all goals for the logged-in user
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // Also return wallet balance so frontend can evaluate purchase readiness
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      savingsWallet: user.savingsWallet,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error("Get goals error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching goals",
    });
  }
};

/**
 * @desc    Delete a goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    // Ensure user owns the goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal",
      });
    }

    await goal.deleteOne();

    res.json({ success: true, message: "Goal deleted" });
  } catch (error) {
    console.error("Delete goal error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting goal",
    });
  }
};

/**
 * @desc    Purchase a goal (deduct from wallet, delete goal)
 * @route   POST /api/goals/:id/buy
 * @access  Private
 */
const buyGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id);

    if (user.savingsWallet < goal.targetPrice) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Need ₹${goal.targetPrice}, have ₹${user.savingsWallet}`,
      });
    }

    // Deduct from wallet
    user.savingsWallet -= goal.targetPrice;
    await user.save();

    // Remove goal
    await goal.deleteOne();

    res.json({
      success: true,
      message: `🎉 Purchased "${goal.itemName}" for ₹${goal.targetPrice}!`,
      savingsWallet: user.savingsWallet,
    });
  } catch (error) {
    console.error("Buy goal error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during purchase",
    });
  }
};

module.exports = { createGoal, getGoals, deleteGoal, buyGoal };

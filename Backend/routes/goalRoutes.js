const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createGoal,
  getGoals,
  deleteGoal,
  buyGoal,
} = require("../controllers/goalController");

// All goal routes are protected
router.use(protect);

// POST   /api/goals          — Create a new goal
router.post("/", createGoal);

// GET    /api/goals          — Get all goals for user
router.get("/", getGoals);

// DELETE /api/goals/:id      — Delete a goal
router.delete("/:id", deleteGoal);

// POST   /api/goals/:id/buy  — Purchase a goal (deduct from wallet)
router.post("/:id/buy", buyGoal);

module.exports = router;

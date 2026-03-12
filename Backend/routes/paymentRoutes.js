const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  makePayment,
  getTransactions,
} = require("../controllers/paymentController");

// All payment routes are protected
router.use(protect);

// POST /api/pay              — Make a payment (with round-up savings)
router.post("/", makePayment);

// GET  /api/transactions     — Get all transactions for user
router.get("/transactions", getTransactions);

module.exports = router;

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Transaction description is required"],
      trim: true,
    },
    originalAmount: {
      type: Number,
      required: [true, "Original amount is required"],
      min: [1, "Amount must be at least ₹1"],
    },
    roundedAmount: {
      type: Number,
      required: true,
    },
    savedAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    targetPrice: {
      type: Number,
      required: [true, "Target price is required"],
      min: [1, "Target price must be at least ₹1"],
    },
    image: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);

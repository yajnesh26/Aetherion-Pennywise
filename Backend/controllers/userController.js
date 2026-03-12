const User = require("../models/User");

/**
 * @desc    Update logged-in user's banking/profile details
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, accountNumber, ifscCode, upiId } = req.body;

    // Basic validations
    if (!phoneNumber || !/^\d{10}$/.test(String(phoneNumber))) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }
    if (accountNumber && !/^\d+$/.test(String(accountNumber))) {
      return res.status(400).json({ success: false, message: "Account number must be numeric" });
    }

    const updates = {
      phoneNumber: String(phoneNumber),
      accountNumber: accountNumber ? String(accountNumber) : null,
      ifscCode: ifscCode ? String(ifscCode) : null,
      upiId: upiId ? String(upiId) : null,
    };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
};

module.exports = { updateProfile };

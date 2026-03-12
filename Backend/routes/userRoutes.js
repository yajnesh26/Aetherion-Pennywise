const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/userController");

// All user routes require authentication
router.use(protect);

// PUT /api/user/profile
router.put("/profile", updateProfile);

module.exports = router;

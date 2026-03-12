const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { fetchProduct } = require("../controllers/productController");

// POST /api/product/fetch — scrape product info from a URL
router.post("/fetch", protect, fetchProduct);

module.exports = router;

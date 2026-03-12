const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ── Load environment variables ────────────────────────────
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────
connectDB();

// ── Initialise Express ────────────────────────────────────
const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors()); // Allow cross-origin requests from React frontend
app.use(express.json()); // Parse JSON request bodies
const session = require("express-session");
const passport = require("passport");
// Initialize passport strategies
require("./config/passport")(passport);

// Session is required by passport for OAuth flows
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ── Health-check route ────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    message: "🚀 PennyWise API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/register  |  /api/auth/login",
      goals: "/api/goals  (GET, POST, DELETE /:id, POST /:id/buy)",
      payments: "/api/pay  (POST)  |  /api/transactions  (GET)",
      ai: "/api/ai/ask  (POST)",
      product: "/api/product/fetch  (POST)",
    },
  });
});

require("dotenv").config();
// ── Route mounting ────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/pay", require("./routes/paymentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// GET /api/transactions — proxy to payment routes
app.use("/api", require("./routes/paymentRoutes"));

// ── 404 fallback ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 PennyWise server running on http://localhost:${PORT}\n`);
});

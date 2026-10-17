const express = require("express");
const router = express.Router();
const passport = require("passport");
const { register, login, generateToken } = require("../controllers/authController");
const { createRateLimiter } = require("../middleware/rateLimit");

// SEC-02 — per-endpoint rate limiting with independent counters.
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

// POST /api/auth/register
router.post("/register", registerLimiter, register);

// POST /api/auth/login
router.post("/login", loginLimiter, login);

// --- Google OAuth routes (only active when configured) -----------------
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	// GET /api/auth/google — start Google OAuth flow
	router.get(
		"/google",
		passport.authenticate("google", { scope: ["profile", "email"] })
	);

	// GET /api/auth/google/callback — handle Google callback
	router.get(
		"/google/callback",
		passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : "http://localhost:5173/login" }),
		(req, res) => {
			// Successful authentication, issue JWT and redirect to frontend with token
			try {
				const token = generateToken(req.user._id);
				const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
				// Redirect to dashboard with token as query param — frontend will pick it up and store in localStorage
				return res.redirect(`${frontend}/dashboard?token=${token}`);
			} catch (err) {
				console.error("OAuth redirect error:", err);
				return res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : "http://localhost:5173/login");
			}
		}
	);
} else {
	// If OAuth not configured, return helpful message instead of throwing
	router.get("/google", (_req, res) => {
		return res.status(501).json({
			success: false,
			message:
				"Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend .env and restart.",
		});
	});

	router.get("/google/callback", (_req, res) => {
		const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
		return res.redirect(`${frontend}/login`);
	});
}

module.exports = router;

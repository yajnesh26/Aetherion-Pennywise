const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('../controllers/authController');

// SEC-04 — safe Google account linking.
//
// The installed passport-google-oauth20 (2.0.0) fetches the default
// `https://www.googleapis.com/oauth2/v3/userinfo` endpoint and parses it with
// lib/profile/openid.js, which sets `profile.emails[0].verified` directly from
// Google's `email_verified` claim (the google+ parser never sets it at all).
// Only the boolean literal `true` is accepted as proof that Google verified
// the address; missing, undefined, null or non-boolean values are treated as
// unverified and fail closed.
//
// Local registration does not verify email ownership, so a Google identity is
// NEVER attached to an existing password-based account on an email match.
const FAILURE_MESSAGE =
  "Unable to sign in with Google. Please sign in with your email and password instead.";

// Returns the profile's email address ONLY when Google explicitly marked it
// verified; otherwise null (unverified, unknown, malformed or absent). The
// value is normalized (trimmed + lowercased) to match how the User schema
// stores email (`lowercase: true`, `trim: true`), so the lookup at the email
// step cannot miss an existing account over casing or surrounding whitespace.
function verifiedGoogleEmail(profile) {
  const entry = profile && Array.isArray(profile.emails) && profile.emails[0];
  if (!entry || typeof entry.value !== 'string' || entry.verified !== true) return null;
  const email = entry.value.trim().toLowerCase();
  return email || null;
}

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Configure Google strategy only if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // 1. The stable Google identity is authoritative first, so existing
            //    Google users keep signing in even when the profile carries no
            //    email. Reject a malformed profile instead of querying with it.
            if (!profile || typeof profile.id !== 'string' || !profile.id) {
              return done(null, false, { message: FAILURE_MESSAGE });
            }

            const linkedUser = await User.findOne({ googleId: profile.id });
            if (linkedUser) return done(null, linkedUser);

            // 2. The email may only be used when Google explicitly verified it.
            const email = verifiedGoogleEmail(profile);
            if (!email) {
              return done(null, false, { message: FAILURE_MESSAGE });
            }

            // 3. NEVER auto-link by email: registration does not verify email
            //    ownership, so a matching local account is not proven to belong
            //    to this Google identity. Fail through the normal Passport
            //    failure path (existing failure redirect keeps working), and
            //    do not save, modify or return the local account.
            const localAccount = await User.findOne({ email });
            if (localAccount) {
              return done(null, false, { message: FAILURE_MESSAGE });
            }

            // 4. Verified email with no local account — unchanged sign-up flow.
            const name = profile.displayName || (profile.name && `${profile.name.givenName} ${profile.name.familyName}`) || 'Google User';
            const newUser = new User({
              name,
              email,
              googleId: profile.id,
              savingsWallet: 0,
            });

            await newUser.save();
            return done(null, newUser);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  } else {
    console.warn('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
  }
};

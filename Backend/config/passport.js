const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('../controllers/authController');

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
            const email = profile.emails && profile.emails[0] && profile.emails[0].value;
            const name = profile.displayName || (profile.name && `${profile.name.givenName} ${profile.name.familyName}`) || 'Google User';

            // Try find by googleId
            let user = await User.findOne({ googleId: profile.id });
            if (user) return done(null, user);

            // If not found, try by email
            if (email) {
              user = await User.findOne({ email });
              if (user) {
                // attach googleId
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
              }
            }

            // Create new user
            const newUser = new User({
              name,
              email: email || undefined,
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

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "1011823152528-m1hem7upbt6rgibtl08ppr9aqhlriuql.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user authentication
      done(null, profile);
    }
  )
);

// Serialize and deserialize user
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

export default passport;
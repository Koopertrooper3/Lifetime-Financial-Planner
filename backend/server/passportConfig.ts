import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from '../schemas/User';
import mongoose from 'mongoose';

interface IUser {
  googleId: string;
  name: string;
  ownedSenarios: mongoose.Types.ObjectId[];
  sharedSenarios: mongoose.Types.ObjectId[];
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "1011823152528-m1hem7upbt6rgibtl08ppr9aqhlriuql.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:8000/auth/google/callback", // where to redirect user upon successfully login
    },
    async function verify(accessToken, refreshToken, profile, done){ // This middleware is called when user successfully log in to google
      try{
        let user : IUser | null = await User.findOne({ googleId: profile.id });
        if(!user){ // if no user exists, we will make an user entry
          let newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            ownedSenarios: [],
            sharedSenarios: []
          });
          user = await newUser.save();
        }
        done(null, user);
      }
      catch(err){
        done(err);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // done(null, user);
});

export default passport;
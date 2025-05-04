import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import {User, IUser} from '../db/User';
import dotenv from 'dotenv';
import process from 'process';
import path from "path";
dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env') });

const backend_full_url = "http://" + process.env.BACKEND_IP + ":" + process.env.BACKEND_PORT;

// Config Guest Strategy
passport.use('guest', new LocalStrategy(
  async (username, password, done) => {
    try {
      console.log('Creating guest user...');
      const guestName =  `Guest-${Math.random().toString(36).substring(2, 8)}`;
      const guestUser = new User({
        googleId: "123456",
        email: guestName + "@gmail.com",
        name: guestName,
        ownedScenarios: [],
        sharedScenarios: []
      });
      
      const savedUser = await guestUser.save();
      done(null, savedUser);
    } catch (err) {
      done(err);
    }
  }
));

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: backend_full_url + "/auth/google/callback" // where to redirect user upon successfully login
    },
    async function verify(accessToken, refreshToken, profile, done){ // This middleware is called when user successfully log in to google
      try{
        let user : IUser | null = await User.findOne<IUser>({ googleId: profile.id });
        if(!user){ // if no user exists, we will make an user entry
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            ownedScenarios: [],
            sharedScenarios: [],
            stateTaxes: {}
          });
          user = (await newUser.save()) as IUser;
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
passport.serializeUser((user:any, done) => {
  console.log("serializeUser called");
  done(null, user._id);
});

passport.deserializeUser(async (_id : string, done) => {
  console.log("deserialize is called with _id: " + _id);
  try {
    // Fetch the user from the database using the googleId
    const user = await User.findById(_id);
    if (user) {
      // If the user is found, pass the user object to Passport
      console.log("user found: " + user);
      done(null, user);
    } else {
      console.log("user not found: ");
      // If the user is not found, pass an error
      done(new Error("User not found"));
    }
  } catch (err) {
    // If there's an error (e.g., database connection issue), pass it to Passport
    done(err);
  }
});

export default passport;
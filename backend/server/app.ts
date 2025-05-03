import express from "express";
import passport from "./passportConfig";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import {router as scenarioRouter} from "./routers/scenarioRouter";
import userRouter from './routers/userRouter';
import path from "path";

console.log(path.resolve(__dirname,'..','..','..','.env'))
dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')});
const fullMongoUrl = (process.env.DATABASE_HOST + ":" + process.env.DATABASE_PORT + "/" + process.env.DATABASE_NAME) || 'mongodb://mongodb:127.0.0.1:27017/CSE416';
const fullFrontendUrl = ("http://" + process.env.FRONTEND_IP + ":" + process.env.FRONTEND_PORT) || "http://localhost:5173";
const app = express();

// middlewares
app.use(cors({
    origin: fullFrontendUrl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(
    session({
        secret: "some-secret-key",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true, // Prevent client-side JS from accessing the cookie
            sameSite: true,
        },
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: fullMongoUrl })
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => { //debug middleware
    console.log("Request received:", req.method, req.url);
    console.log("Session ID:", req.sessionID);
    console.log("Authenticated:", req.isAuthenticated());
    next();
});

// routes
app.use("/scenario", scenarioRouter);
app.use("/user", userRouter);

// this is the route called when user clicks login using google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

// this is a callback from passport after google login
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/loginfail' }), // this is a middleware by passport that runs the verify function in passport.use
    (req, res) => {
        res.redirect(fullFrontendUrl + "/dashboard");
    }
);

// this route gets called if one of the following is met
// User Denies Permission on the Consent Screen in google login
// Invalid or Expired Authorization Code in google login
// Network or Server Errors (google server down),
// or we specifically defined the login as an error in 'verify' using done(null, false)
app.get("/loginfail", (req, res) => {
    res.redirect(fullFrontendUrl);
});

export default app;
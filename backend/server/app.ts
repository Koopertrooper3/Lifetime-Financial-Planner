import express from "express";
import passport from "./passportConfig";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();
const fullMongoUrl = (process.env.DATABASE_HOST + ":" + process.env.DATABASE_PORT + "/" + process.env.DATABASE_NAME) || 'mongodb://mongodb:127.0.0.1:27017/CSE416';
const fullFrontendUrl = ("http://" + process.env.FRONTEND_IP + ":" + process.env.FRONTEND_PORT) || "http://localhost:5173";
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(
    session({
        secret: "some-secret-key",
        cookie: {},
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: fullMongoUrl })
}))

app.use(passport.initialize())
app.use(passport.session())

// routes

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

app.get("/user", (req, res) => {
    if(req.isAuthenticated()){
        res.send(req.user);
    }
    else{
        res.send("error not authenticated");
    }
})

export default app;
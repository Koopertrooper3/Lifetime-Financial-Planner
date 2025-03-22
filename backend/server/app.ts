import express from "express";
import passport from "./passportConfig";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();
const fullMongoUrl = (process.env.DATABASE_HOST + ":" + process.env.DATABASE_PORT + "/" + process.env.DATABASE_NAME) || 'mongodb://mongodb:127.0.0.1:27017/CSE416';

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
        store: MongoStore.create({mongoUrl: fullMongoUrl })
}))

app.use(passport.initialize())
app.use(passport.session())

// routes

export default app;
import express from 'express';
import User from '../../db/User';
import z from "zod";

const router = express.Router();

const userZod = z.object({
    googleId: z.string().min(1, "id must not be empty"),
    name: z.string().min(1, "name must not be empty")
}).strict();

router.post("/create", async (req, res) => {
    try{
        userZod.parse(req.body);
        
        const newUser = await User.create({
            googleId: req.body.googleId,
            name: req.body.name,
            ownedScenarios: [],
            sharedScenarios: [],
            stateTaxes: {}
        });

        await newUser.save();

        res.status(200).send({ message: "User created successfully", googleId: req.body.googleId });
    }
    catch(err){
        console.error("Error creating user:", err);
        res.status(400).send({ message: "Error creating user", err });
    }
})

export default router;
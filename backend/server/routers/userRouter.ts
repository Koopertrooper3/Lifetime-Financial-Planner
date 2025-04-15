import express from 'express';
import User from '../../db/User';
import z from "zod";
import { stateTaxZod } from '../zod/taxesZod';

const router = express.Router();

const userCreateZod = z.object({
    googleId: z.string().min(1, "id must not be empty"),
    name: z.string().min(1, "name must not be empty")
}).strict();

const userEditZod = z.object({
    googleId: z.string().min(1, "id must not be empty"),
    name: z.string().min(1, "name must not be empty"),
    stateTaxes: stateTaxZod
}).strict();

router.post("/create", async (req, res) => {
    try{
        userCreateZod.parse(req.body);
        
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
});

router.post("/edit", async (req, res)=>{
    try{
        userEditZod.parse(req.body);

        const userToEdit = await User.findOne({googleId: req.body.googleId});

        if(userToEdit == null){
            res.status(400).send({ message: `No user found with googleId: ${req.body.googleId}` });
            return;
        }

        userToEdit.name = req.body.name;
        userToEdit.stateTaxes = req.body.stateTaxes;

        await userToEdit.save();

        res.status(200).send({ message: `successfully updated user with googleId ${req.body.googleId}` });
    }
    catch(err){
        console.error("Error editing user:", err);
        res.status(400).send({ message: "Error editing user", err });
    }
})

export default router;
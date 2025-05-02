import express from 'express';
import {User} from '../../db/User';
import z from "zod";
import mongoose from 'mongoose';
import { SharedScenario } from '../../db/User';
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


router.get("/", (req, res) => {
    console.log("/user is called");
    if(req.isAuthenticated()){
        console.log("user is authenticated: " + req.user);
        res.send(req.user);
    }
    else{
        console.log("user not authenticated");
        res.send("error not authenticated");
    }
})

router.post("/create", async (req, res) => {
    try{
        userCreateZod.parse(req.body);
        
        const newUser = await User.create({
            googleId: "none",
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


interface shareScenarioRequest {
    access: "read-only" | "read-write"
    scenarioID : string
    owner: string
    shareWith: string
}
router.post("/shareScenario", async (req, res) => {
    try{
        const shareScenarioRequest : shareScenarioRequest = req.body
        const owner = await User.findById(shareScenarioRequest.owner).lean()
        const shareWithUser = await User.findById(shareScenarioRequest.shareWith)

        if(shareWithUser == null){
            throw new Error("User does not exist")
        }

        if(owner == null){
            throw new Error("Owner does not exist")
        }
        const ownerScenarioCheck = owner.ownedScenarios.some(function (scenarioID) {
            return scenarioID.equals(scenarioID);
        });

        if(ownerScenarioCheck == false){
            throw new Error("Owner does not own claimed scenario")
        }
        const sharedScenarioObject : SharedScenario = {
            permission: shareScenarioRequest.access,
            scenarioID: new mongoose.Types.ObjectId(shareScenarioRequest.scenarioID)
        }
        shareWithUser.sharedScenarios.push(sharedScenarioObject)
        await shareWithUser.save();

        res.status(200).send({ message: "Scenario created shared!" });
    }
    catch(err){
        console.error("Error creating user:", err);
        res.status(400).send({ message: "Error creating user", err });
    }
})


router.post("/uploadTaxes", async (req, res) => {
    try{
        throw new Error("not implemented")
    }
    catch(err){
        console.error("Error creating user:", err);
        res.status(400).send({ message: "Error uploading taxes", err });
    }
})
export default router;
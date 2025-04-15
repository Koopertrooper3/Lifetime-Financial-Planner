import express from 'express';
import {User} from '../../db/User';
import z from "zod";
import mongoose from 'mongoose';
import { SharedScenario } from '../../db/User';

const router = express.Router();

const userZod = z.object({
    googleId: z.string().min(1, "id must not be empty"),
    name: z.string().min(1, "name must not be empty")
}).strict();

router.post("/createGuest", async (req, res) => {
    try{
        userZod.parse(req.body);
        
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
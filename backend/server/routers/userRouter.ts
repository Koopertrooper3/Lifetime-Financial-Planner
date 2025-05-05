import express from 'express';
import {User} from '../../db/User';
import z from "zod";
import mongoose from 'mongoose';
import { SharedScenario } from '../../db/User';
import { stateTaxZod } from '../zod/taxesZod';
import { authenticate } from 'passport';
import { parse } from 'yaml'
import multer from 'multer';

const router = express.Router();
const fileUpload = multer({ storage: multer.memoryStorage() })

const userCreateZod = z.object({
    googleId: z.string().min(1, "id must not be empty"),
    email: z.string(),
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
        console.log("user is authenticated");
        res.send({
            user: req.user,
            authenticated: true,
            msg: "user is authenticated"
        });
    }
    else{
        console.log("user not authenticated");
        res.send({
            user: null,
            authenticated: false,
            msg: "error not authenticated"
        });
    }
})

router.post("/create", async (req, res) => {
    try{
        userCreateZod.parse(req.body);
        
        const newUser = await User.create({
            googleId: req.body.googleId || "none",
            email: req.body.email,
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

router.post("/getIdFromEmail", async (req:any, res:any) => {
    try {
        const email = req.body.email;
        
        if (!email) {
            return res.json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email: email }).select('_id');
        
        if (!user) {
            return res.json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.json({ 
            success: true, 
            userId: user._id 
        });

    } catch (err) {
        console.error("Error finding user by email:", err);
        res.json({ 
            success: false, 
            message: "Server error while finding user" 
        });
    }
});

interface shareScenarioRequest {
    permission: "read-only" | "read-write"
    scenarioID : string
    owner: string
    shareWith: string
}
router.post("/shareScenario", async (req:any, res:any) => {
    try{
        const shareScenarioRequest : shareScenarioRequest = req.body
        const owner = await User.findById(shareScenarioRequest.owner).lean()
        const shareWithUser = await User.findById(shareScenarioRequest.shareWith)

        const shareWithUserSharedScenarios = shareWithUser?.sharedScenarios;
        if(shareWithUserSharedScenarios && shareWithUserSharedScenarios.length > 0){
            for(const entry of shareWithUserSharedScenarios){
                if(String(entry.scenarioID) == shareScenarioRequest.scenarioID){
                    return res.send({ success: false, msg: "User already has access to this scenario" });
                }
            }
        }

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
            permission: shareScenarioRequest.permission,
            scenarioID: new mongoose.Types.ObjectId(shareScenarioRequest.scenarioID)
        }
        shareWithUser.sharedScenarios.push(sharedScenarioObject)
        await shareWithUser.save();

        res.status(200).send({ success: true, msg: "Scenario created shared!" });
    }
    catch(err){
        console.error("Error creating user:", err);
        res.send({ success: false, msg: "Error creating user", err });
    }
})


router.post("/upload-tax",fileUpload.single('yaml'), async (req, res) => {
    try{
        const file = req.file
        const body = req.body
        if(file == undefined){
            throw new Error("No yaml file")
        }
        const parsedTaxes = parse(file.buffer.toString())
        const userProfile = await User.findById(body.id)
        if(userProfile == undefined){
            throw new Error("Non existence user");
        }
        userProfile.stateTaxes= parsedTaxes
        userProfile.save();
        res.status(200).send();
    }
    catch(err){
        console.error("Error creating user:", err);
        res.status(400).send({ message: "Error uploading taxes", err });
    }
})
export default router;
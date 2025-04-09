/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { getScenario, getAllScenarios } from "./../controllers/scenario-controller";
import {Scenario,scenarioModel} from '../../db/Scenario';
import scenarioZod from '../zod/scenarioZod';
import User from '../../db/User';
import z from "zod";
import { Request, Response } from 'express';
export const router = express.Router();

router.get('/', getAllScenarios);

router.get('/:id', getScenario);

const createScenarioZod = z.object({
    userID: z.string(),
    scenario: scenarioZod
});

// when creating a scenario, the route expects two main fields: userID and scenario
router.post("/create", async (req, res) => {

    try {
        // first check to see if the request body is valid using zod validation, failure will throw error and be caught
        createScenarioZod.parse(req.body);

        // now check to see if the user with userID exists, failure will throw error
        const user = await User.findById(req.body.userID);
        
        if(user == null){
            throw new Error("User does not exist")
        }
        // create the scenario
        const newScenario = await scenarioModel.create(req.body.scenario);

        // save the scenario to the User's ownedScenario
        user?.ownedScenarios.push(newScenario._id);

        await user?.save()

        res.status(200).send({ message: "Scenario created successfully", scenarioID: newScenario._id });
    } catch (error) {
        console.error("Error creating scenario:", error);
        res.status(400).send({ message: "Error creating scenario", error });
    }
});

// interface createScenarioBody{
//     userID: string,
//     scenario: Scenario
// }

//TP: Code below created with Github Copilot with the prompt 
//"Create a express route that creates a scenario"
// router.post("/create", async (req: Request, res: Response) => {
//     const reqBody : createScenarioBody = req.body;

//     try {
//         const user = await User.findById(reqBody.userID)
//         const newScenario =  await scenarioModel.create(reqBody.scenario);
        
//         user?.ownedScenarios.push(newScenario._id)
//         user?.save()

//         res.status(200).send({ message: "Scenario created successfully", scenarioID: newScenario._id });
//     } catch (error) {
//         console.error("Error creating scenario:", error);
//         res.status(500).send({ message: "Error creating scenario", error });
//     }
// });
import express from 'express';
import { getScenario, getAllScenarios } from "./../controllers/scenario-controller";
import Scenario from '../../db/old/Scenario';
import scenarioZod from '../zod/scenarioZod';
import User from '../../db/User';
import z from "zod";

const router = express.Router();

router.get('/', getAllScenarios);

router.get('/:id', getScenario);

const createScenarioZod = z.object({
    userID: z.string(),
    scenarioZod
});

// when creating a scenario, the route expects two main fields: userID and scenario
router.post("/create", async (req, res) => {
    try {
        // first check to see if the request body is valid using zod validation, failure will throw error and be caught
        const validatedScenario = createScenarioZod.parse(req.body);

        // now check to see if the user with userID exists, failure will throw error
        const user = await User.findById(req.body.userID);
        
        // create the scenario
        const newScenario = await Scenario.create(req.body.scenario);

        // save the scenario to the User's ownedScenario
        user?.ownedScenarios.push(newScenario._id);

        res.status(200).send({ message: "Scenario created successfully", scenarioID: newScenario._id });
    } catch (error) {
        console.error("Error creating scenario:", error);
        res.status(400).send({ message: "Error creating scenario", error });
    }
});

export default router;
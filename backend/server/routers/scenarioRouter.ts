import {Router, Request, Response} from 'express';
import {scenarioModel} from '../../db/Scenario';
import scenarioZod from '../zod/scenarioZod';
import {User, IUser} from '../../db/User';
import z from "zod";
export const router = Router();

interface UserCookie {
  id : string
}
router.get('/', async (req : Request, res: Response) => {
    try {
      const scenarios = await scenarioModel.find({});
      res.status(200).json({ data : scenarios });
    }
    catch (error: unknown) {
      console.log(`Error in fetching scenarios: `, (error as Error).message);
      res.status(500).json({ message: 'Server error' });
    }
});

router.get('/userScenarios', async (req : Request, res: Response) => {
  try {
    const user : IUser | null = await User.findById((req.user as UserCookie).id).lean()
    if(user == null){
      throw new Error("User does not exist")
    }
    const ownedScenarios = await scenarioModel.find({ _id: { $in: user.ownedScenarios } }).lean()
    const sharedScenarios = await scenarioModel.find({ _id: { $in: user.sharedScenarios } }).lean()
    res.status(200).json({ ownedScenarios : ownedScenarios, sharedScenarios : sharedScenarios });
  }
  catch (error: unknown) {
    console.log(`Error in fetching scenarios: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', async (req : Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const scenario = await scenarioModel.findById(id);
      console.log(scenario)
      res.status(200).json({ data : scenario });
    } catch (error: unknown) {
      console.log(`Error in fetching scenario ${id}: `, (error as Error).message);
      res.status(500).json({ message: 'Server error' });
    }
  });

const createScenarioZod = z.object({
    userID: z.string(),
    scenario: scenarioZod
});

// when creating a scenario, the route expects two main fields: userID and scenario
router.post("/create", async (req, res) => {
    console.log("/scenario/create endpoint hit");

    try {
        console.log("Incoming body:", req.body);
        // first check to see if the request body is valid using zod validation, failure will throw error and be caught
        createScenarioZod.parse(req.body);

        console.log("parsing request body is fine")
        
        // now check to see if the user with userID exists, failure will throw error
        const user = await User.findOne({_id: req.body.userID});
        
        if(user == null){
            throw new Error("User does not exist")
        }
        // create the scenario
        const newScenario = await scenarioModel.create(req.body.scenario);

        // save the scenario to the User's ownedScenario
        user?.ownedScenarios.push(newScenario._id);

        await user?.save()

        const test = await scenarioModel.findById(newScenario._id)
        console.log("The following scenario just got added: ");
        console.log(test);

        console.log(`scenario added to user ${user.name}`)
        res.status(200).send({ message: "Scenario created successfully", scenarioID: newScenario._id });
    } catch (error) {
        console.error("Error creating scenario:", error);
        res.status(400).send({ message: "Error creating scenario", error });
    }
});

const editScenarioZod = z.object({
  userID: z.string(),
  scenarioID: z.string(),
  updatedFields: scenarioZod._def.schema.partial()
});

// when editing a scenario, the route expects two main fields: userID, scenario._id, and scenario
router.post("/edit", async (req, res) => {
  console.log("/scenario/edit hit");

  try {
      console.log("Incoming body:", JSON.stringify(req.body.updatedFields, null, 2));
      
      editScenarioZod.parse(req.body); // Allows partial updates

      // now check to see if the user with userID exists, failure will throw error
      const user = await User.findById(req.body.userID);
      if (!user) {
          throw new Error("User does not exist");
      }

      // console.log("Edit Scenario Backend After user: ", req.body);
      // Print updatedFields with full object expansion
      console.log("Edit Scenario Backend After user:", 
        JSON.stringify(req.body.updatedFields, null, 2));

      // Update ONLY the specified fields using `$set`
      const updatedScenario = await scenarioModel.findOneAndUpdate(
          { _id: req.body.scenarioID }, 
          { $set: req.body.updatedFields }, // Only updates provided fields
          { new: true } // Return the updated document
      );

      // console.log("Edit Scenario Backend After findOneAndUpdate: ", updatedScenario);
      console.log("Edit Scenario Backend After findOneAndUpdate:", 
        JSON.stringify(updatedScenario?.toObject(), null, 2));

      if (!updatedScenario) {
          throw new Error("Scenario not found or user mismatch");
      }

      res.status(200).json({ 
          message: "Scenario updated successfully", 
          data: updatedScenario 
      });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating scenario:", error.message);
      res.status(400).json({ 
        message: "Error updating scenario", 
        error: error.message 
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ 
        message: "An unknown error occurred" 
      });
    }
  }
});

// router.post("/edit", async (req, res) => {
//   console.log("/scenario/edit hit");

//   try {
//       console.log("Incoming body:", req.body);
//       // first check to see if the request body is valid using zod validation, failure will throw error and be caught
//       createScenarioZod.parse(req.body);

//       // now check to see if the user with userID exists, failure will throw error
//       const user = await User.findById(req.body.userID);
      
//       if(user == null){
//           throw new Error("User does not exist")
//       }
      
//       // Replace the scenario by ID
//       const updatedScenario = await scenarioModel.findOneAndReplace(
//         { _id: req.body.scenarioID },
//         req.body.scenario,
//         { new: true } // Return the updated document
//       );

//       if (!updatedScenario) {
//         throw new Error("Scenario was not found");
//       }

//       res.status(200).send({ message: "Scenario updated successfully", scenarioID: updatedScenario._id });
//   } catch (error) {
//       console.error("Error updating scenario:", error);
//       res.status(400).send({ message: "Error updating scenario", error });
//   }
// });

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


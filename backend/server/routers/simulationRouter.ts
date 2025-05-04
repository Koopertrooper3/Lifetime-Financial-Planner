/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from "express";
import { scenarioModel } from "../../db/Scenario";
import z from "zod";
//@ts-expect-error Incomplete
import { runParameterSweepSimulations } from "../../simulator/simulationHead";
import { simulatorQueue } from "../server";

// NOTE: this is not mounted in server.ts 

const simulationRouter = express.Router();


const simExploreZod = z.object({
    scenarioId: z.string().min(1),
    parameterName: z.string().min(1),
    lowerBound: z.number(),
    upperBound: z.number(),
    stepSize: z.number().positive(),
  });
  
/**
 * POST /simulation-explore 
 * Accepts a scenarioId and numeric parameter sweep instructions.
 * Calls a helper function (to be implemented in simulationHead.ts) to:
 *  - Modify the scenario for each parameter value
 *  - Queue the scenario into the existing simulation pipeline
 *  - Return an aggregated result object for charting
 */

interface runSimulationBody{
  userID: string,
  scenarioID: string
  totalSimulations: number
}
simulationRouter.post("/run-simulation", async (req : Request, res : Response)=>{
  try{
      console.log("Job request")
      const requestBody : runSimulationBody = req.body
      const job = await simulatorQueue.add("simulatorQueue", {userID: requestBody.userID, scenarioID : requestBody.scenarioID, totalSimulations : requestBody.totalSimulations},{ removeOnComplete: true, removeOnFail: true })

      //const result = await job.waitUntilFinished(queueEvents,1000*60*1)
      res.status(200).send({completed : 0, succeeded: 0, failed: 0})
  }catch(err){
      console.log((err as Error))
      res.status(400).send({completed : 0, succeeded: 0, failed: 0})
  }
  
});

simulationRouter.post("/simulation-explore", async (req,res) => {
  const validated = simExploreZod.parse(req.body);

  try {
    const baseScenario = await scenarioModel.findById(validated.scenarioId).lean();
    if (!baseScenario) {
      res.status(404).json({ error: "Scenario not found." });
    }

    /**
     * NOTE:
     * The `runParameterSweepSimulations()` or some similar 
     * function needs to be implemented in simulationHead.ts.
     */
    const results = await runParameterSweepSimulations(
        baseScenario,
        validated.parameterName,
        validated.lowerBound,
        validated.upperBound,
        validated.stepSize
    );

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Simulation failed or not implemented yet." });
  }
});

export default simulationRouter;

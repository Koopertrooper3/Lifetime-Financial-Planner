/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from "express";
import { scenarioModel } from "../../db/Scenario";
import z from "zod";
//@ts-expect-error Incomplete
import { runParameterSweepSimulations } from "../../simulator/simulationHead";
import { explorationQueue, simulatorQueueEvents, explorationQueueEvents, simulatorQueue } from "../server";
import { numericalExploration, RothExploration } from "../../simulator/simulatorInterfaces";

const simulationRouter = express.Router();


const simExploreZod = z.object({
    scenarioId: z.string().min(1),
    parameterName: z.string().min(1),
    lowerBound: z.number(),
    upperBound: z.number(),
    stepSize: z.number().positive(),
  });
  

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

      res.status(200).send(job.id)
  }catch(err){
      console.log((err as Error))
      res.status(400)
  }
  
});

simulationRouter.post("/run-simulation/poll", async (req : Request, res : Response)=>{
  try{
      console.log("Job request")
      const jobid = req.body.id
      const job = await simulatorQueue.getJob(jobid.toString()) 
      if(job == undefined){
        throw new Error("Job does not exist")
      }
      const result = await job.waitUntilFinished(simulatorQueueEvents)
      res.status(200).send(true)
  }catch(err){
      console.log((err as Error))
      res.status(400)
  }
  
});

/**
 * POST /simulation-explore 
 * Accepts a scenarioId and numeric parameter sweep instructions.
 * Calls a helper function (to be implemented in simulationHead.ts) to:
 *  - Modify the scenario for each parameter value
 *  - Queue the scenario into the existing simulation pipeline
 *  - Return an aggregated result object for charting
 */

interface explorationBody {
  scenarioID: string,
  userID: string,
  totalSimulations: number,
  explorationParameter: RothExploration | numericalExploration
}

simulationRouter.post("/simulation-explore", async (req,res) => {
  //const validated = simExploreZod.parse(req.body);
  const explorationRequest : explorationBody = req.body
  try {
    const baseScenario = await scenarioModel.findById(explorationRequest.scenarioID).lean();
    if (!baseScenario) {
      res.status(404).json({ error: "Scenario not found." });
    }

    const job = await explorationQueue.add("scenarioExplorationQueue",{
      userID: explorationRequest.userID, 
      scenarioID : explorationRequest.scenarioID, 
      totalSimulations : explorationRequest.totalSimulations,
      explorationPrameters : explorationRequest.explorationParameter
    },{ removeOnComplete: true, removeOnFail: true })

    res.status(200).send(job.id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Simulation failed or not implemented yet." });
  }
});

simulationRouter.post("/simulation-explore/poll", async (req : Request, res : Response)=>{
  try{
      console.log("Job request")
      const jobid = req.body.id
      const job = await explorationQueue.getJob(jobid.toString()) 
      if(job == undefined){
        throw new Error("Job does not exist")
      }
      const result = await job.waitUntilFinished(simulatorQueueEvents)
      res.status(200).send(true)
  }catch(err){
      console.log((err as Error))
      res.status(400)
  }
  
});

simulationRouter.get("/fetch-results/:id", async (req,res) => {
  //const validated = simExploreZod.parse(req.body);
  const resultID = req.params.id

  try {
    const results = null;
    if (!results) {
      res.status(404).json({ error: "Results not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Simulation failed or not implemented yet." });
  }
});
export default simulationRouter;

import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import path from 'path';
import mongoose from 'mongoose';
import {Scenario, scenarioModel} from '../db/Scenario';
import * as dotenv from 'dotenv';
import { stateTaxParser } from '../state_taxes/statetax_parser';
import { federalTaxModel,StateTaxBracket } from '../db/taxes';
import {User} from '../db/User';
import { pool } from 'workerpool';
import { numericalExploration, Result, RothExploration } from './simulatorInterfaces';
dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')});

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

const connection = new IORedis({ maxRetriesPerRequest: null });
const MAX_THREADS = Number(process.env.MAX_THREADS) || 1

const simulationWorker = new Worker("simulatorQueue",simulationManager,{connection});
const explorationWorker = new Worker("scenarioExplorationQueue",scenarioExplorationManager,{connection});

const simulatorPool = pool(__dirname + '/simulationWorker.js',{
  maxWorkers: MAX_THREADS
});

console.log("database connection string")
console.log(databaseConnectionString)
mongoose.connect(databaseConnectionString)

// Initialize combined result using the existing Result interface
const combinedResult: Result = {
  completed: 0,
  succeeded: 0,
  failed: 0,
  simulationRecords: {}
};

interface queueData {
  userID: string,
  scenarioID : string;
  totalSimulations: number;
}
interface returnToHostResults {
  completed: number,
  succeeded: number,
  failed: number,
}


async function simulationManager(job: Job) {
  console.log("New Job")
  const jobData : queueData = job.data
  const totalSimulations = jobData.totalSimulations

  const batchSize = Math.floor(totalSimulations/MAX_THREADS)
  let remainder = totalSimulations % MAX_THREADS
  const simulatorBatches : number[] = [... new Array(MAX_THREADS)].map(() => batchSize)
  let index = 0
  while(remainder > 0){
    simulatorBatches[index] += 1
    index = (index+1) % MAX_THREADS
    remainder--;
  }

  const scenario : Scenario | null = await scenarioModel.findById(jobData.scenarioID).lean();
  if(scenario == null){
    throw new Error("Scenario of id does not exist")
  }
  //Collect tax information
  const taxYear = new Date().getFullYear()-1;
  const federalTax = await federalTaxModel.findOne({year: taxYear}).lean()
  // eslint-disable-next-line prefer-const
  let stateTaxes : StateTaxBracket = stateTaxParser()[scenario.residenceState]
  const user = await User.findById(jobData.userID);


  if(stateTaxes == null){
    throw new Error("Implement custom state taxes later")
  }
  
  const threadArray : Promise<Result>[] = []

  for(const batch of simulatorBatches){
    if(batch == 0){
      continue
    }else{
      const workerData = {
        username: user?.name,
        scenarioID : jobData.scenarioID, 
        threadNumber: batch, 
        simulationsPerThread: batch,
        scenario: scenario,
        federalTaxes : federalTax,
        stateTaxes: stateTaxes
    }

    threadArray.push(new Promise((resolve,reject) => {
          
        simulatorPool.exec('simulation',[workerData]).then(
          (simulationResult : Result) =>{
            resolve(simulationResult)
          }
        ).catch(
          (error) =>{
            console.log(error)
            reject(error)
          }
        )
    
    }))
    }

    
  }

  const finalResult : returnToHostResults = {completed : 0, succeeded: 0, failed: 0}
  const jobMessages = await Promise.all(threadArray)

  for(const finalMessage of jobMessages){
    finalResult['completed'] += finalMessage['completed']
    finalResult['succeeded'] += finalMessage['succeeded']
    finalResult['failed'] += finalMessage['failed']
    // Merge simulation by year
    // Merge simulationRecords
    for (const year in finalMessage.simulationRecords) {
      if (!combinedResult.simulationRecords[year]) {
        combinedResult.simulationRecords[year] = [];
      }
      combinedResult.simulationRecords[year].push(...finalMessage.simulationRecords[year]);
    }
  }
  console.log(jobData)
  

  return finalResult
}

simulationWorker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

simulationWorker.on('error', err => {
  // log the error
  console.error(err);
});

interface explorationData {
  userID: string, 
  scenarioID : string, 
  totalSimulations : number,
  explorationPrameters : RothExploration | numericalExploration
}

async function scenarioExplorationManager(job: Job) {
  console.log("New Exploration Job")
  const jobData : explorationData = job.data
  const totalSimulations = jobData.totalSimulations

  const batchSize = Math.floor(totalSimulations/MAX_THREADS)
  let remainder = totalSimulations % MAX_THREADS
  const simulatorBatches : number[] = [... new Array(MAX_THREADS)].map(() => batchSize)
  let index = 0
  while(remainder > 0){
    simulatorBatches[index] += 1
    index = (index+1) % MAX_THREADS
    remainder--;
  }

  const scenario : Scenario | null = await scenarioModel.findById(jobData.scenarioID).lean();
  if(scenario == null){
    throw new Error("Scenario of id does not exist")
  }
  //Collect tax information
  const taxYear = new Date().getFullYear()-1;
  const federalTax = await federalTaxModel.findOne({year: taxYear}).lean()

  const stateTaxes : StateTaxBracket = stateTaxParser()[scenario.residenceState]
  const user = await User.findById(jobData.userID);


  if(stateTaxes == null){
    throw new Error("Implement custom state taxes later")
  }

  const scenarioVariations = determineScenarioVariations(scenario,jobData.explorationPrameters)
  try{
    const threadArray : Promise<Result>[] = []

    for(const batch of simulatorBatches){
      console.log(batch)
      if(batch == 0){
        continue
      }else{

        scenarioVariations.forEach((scenarioVariation) =>{
          console.log(scenarioVariation);
          const workerData = {
            username: user?.name,
            scenarioID : jobData.scenarioID, 
            threadNumber: batch, 
            simulationsPerThread: batch,
            scenario: scenarioVariation,
            federalTaxes : federalTax,
            stateTaxes: stateTaxes
          }

          threadArray.push(new Promise((resolve,reject) => {
            
            simulatorPool.exec('simulation',[workerData]).then(
              (simulationResult : Result) =>{
                resolve(simulationResult)
              }
            ).catch(
              (error) =>{
                console.log(error)
                reject(error)
              }
            )
        
        }))
        })
        
      }

      
    }

    const finalResult : returnToHostResults = {completed : 0, succeeded: 0, failed: 0}
    const jobMessages = await Promise.all(threadArray)

    for(const finalMessage of jobMessages){
      finalResult['completed'] += finalMessage['completed']
      finalResult['succeeded'] += finalMessage['succeeded']
      finalResult['failed'] += finalMessage['failed']
    }
    console.log(jobData)

    return finalResult
    }catch(error){
      console.log(error)
    }
  
}

function determineScenarioVariations(scenario : Scenario, explorationParameters : RothExploration | numericalExploration){
  const scenarioVariations : Scenario[] = []

  if(explorationParameters.type == "roth"){
    const rothOnScenario = structuredClone(scenario)
    const rothOffScenario = structuredClone(scenario)
    rothOnScenario.RothConversionOpt = true;
    rothOffScenario.RothConversionOpt = false;
    scenarioVariations.push(rothOnScenario);
    scenarioVariations.push(rothOffScenario)

  }else if(explorationParameters.type == "income" || explorationParameters.type == "expense"){
    const possibleVariations = range(explorationParameters.upperBound, explorationParameters.lowerBound,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((value) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      if(targetEvent.event.type != "income" && targetEvent.event.type != "expense"){
        throw new Error("Invalid parameter type for event")
      }

      targetEvent.event.initialAmount = value
    })

  }else if(explorationParameters.type == "duration"){
    const possibleVariations = range(explorationParameters.upperBound, explorationParameters.lowerBound,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((startValue) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      targetEvent.duration = {type: "fixed", value: startValue}
    })

  }else if(explorationParameters.type == "startYear"){
    const possibleVariations = range(explorationParameters.upperBound, explorationParameters.lowerBound,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((startValue) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      targetEvent.start = {type: "fixed", value: startValue}
    })

  }else if(explorationParameters.type == "invest"){
    const possibleVariations = range(explorationParameters.upperBound, explorationParameters.lowerBound,explorationParameters.stepSize)

    possibleVariations.forEach((possibleProportion) =>{
      const variationScenario = structuredClone(scenario)
      const targetEventID = Object.values(variationScenario.eventSeries).find((event)=> event.event.type == "invest")?.name

      if(targetEventID == undefined){
        throw new Error("No invest event to parameterize")
      }
      const targetEvent = structuredClone(variationScenario.eventSeries[targetEventID])
      if(targetEvent.event.type != "invest"){
        throw new Error("Event is not an invest event")
      }
      if(Object.entries(targetEvent.event.assetAllocation).length != 2){
        throw new Error("Invest cannot be parameterized")
      }
      const investments = Object.entries(targetEvent.event.assetAllocation)
      const firstInvestmentID = investments[0][0]
      const secondInvestmentID = investments[1][0]

      targetEvent.event.assetAllocation[firstInvestmentID] = possibleProportion
      targetEvent.event.assetAllocation[secondInvestmentID] = (1-possibleProportion)
      variationScenario.eventSeries[targetEventID] = targetEvent
    })
  }else{
    throw new Error("Undefined exploration parameter type")
  }

  return scenarioVariations
}

function range(start: number, stop: number, step: number) {
  //TP: Code obtained from this link https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
  }

  const result : number[] = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
  }

  return result;
};

// Chart 4.1
function calculateProbabilityOfSuccess() {

}

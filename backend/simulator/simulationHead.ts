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
import { AnnualResults } from './simulatorInterfaces';
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

const simulationWorker = new Worker("simulatorQueue",simulationManager,{connection,maxStalledCount: 0});
const explorationWorker = new Worker("scenarioExplorationQueue",scenarioExplorationManager,{connection,maxStalledCount: 0});

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
    for (const year in finalMessage.simulationRecords) {
      if (!combinedResult.simulationRecords[year]) {
        combinedResult.simulationRecords[year] = [];
      }
      combinedResult.simulationRecords[year].push(...finalMessage.simulationRecords[year]);
    }
  }
  console.log(combinedResult.simulationRecords);
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
      console.log(scenarioVariations);

      if(batch == 0){
        continue
      }else{

        scenarioVariations.forEach((scenarioVariation) =>{
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
    const possibleVariations = range(explorationParameters.lowerBound, explorationParameters.upperBound+explorationParameters.stepSize,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((value) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      if(targetEvent.event.type != "income" && targetEvent.event.type != "expense"){
        throw new Error("Invalid parameter type for event")
      }

      targetEvent.event.initialAmount = value
      scenarioVariations.push(variationScenario)
    })

  }else if(explorationParameters.type == "duration"){
    const possibleVariations = range(explorationParameters.lowerBound, explorationParameters.upperBound+explorationParameters.stepSize,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((startValue) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      targetEvent.duration = {type: "fixed", value: startValue}
      scenarioVariations.push(variationScenario)
    })

  }else if(explorationParameters.type == "startYear"){
    const possibleVariations = range(explorationParameters.lowerBound, explorationParameters.upperBound+explorationParameters.stepSize,explorationParameters.stepSize)
    const targetEventID = explorationParameters.eventName
    possibleVariations.forEach((startValue) =>{
      const variationScenario = structuredClone(scenario)
      const targetEvent = variationScenario.eventSeries[targetEventID]

      targetEvent.start = {type: "fixed", value: startValue}
      scenarioVariations.push(variationScenario)

    })

  }else if(explorationParameters.type == "invest"){
    const possibleVariations = range(explorationParameters.lowerBound, explorationParameters.upperBound+explorationParameters.stepSize,explorationParameters.stepSize)

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
      scenarioVariations.push(variationScenario)
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
function calculateProbabilityOfSuccess(simulationRecords : Record<number,AnnualResults[]>) {
  // Just to make sure that the years are sorted in order
  const years: number[] = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  
  const results: { year: number; successPercentage: number }[] = [];

  for (const year of years) {
    const yearResults = simulationRecords[year];
    let successCount = 0;
    const numSimulations = yearResults.length;
    for (let i = 0; i < numSimulations; i++) {
      const financialGoal = yearResults[i].finanicalGoal;
      if (financialGoal) {
        successCount += 1;
      }
    }

    const successPercentage = (successCount / numSimulations) * 100;

    results.push({
      year,
      successPercentage
    });
  }

  return results;
}

// Helper function to calculate percentiles
function calculatePercentile(sortedValues: number[], percentile: number) {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  
  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }
  
  // Linear interpolation between the two nearest values
  return sortedValues[lowerIndex] + 
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * (index - lowerIndex);
}

interface ProbabilityRangesResult {
  year: number;
  selectedQuantity: string;
  median: number;
  percentileValues: Record<string, { min: number; max: number }>;
}

function calculateRanges(numArray: number[]): Record<string, { min: number; max: number }> {
  const ranges = [
    { min: 10, max: 90, label: '10-90%' },
    { min: 20, max: 80, label: '20-80%' },
    { min: 30, max: 70, label: '30-70%' },
    { min: 40, max: 60, label: '40-60%' }
  ];

  const percentileValues: Record<string, { min: number; max: number }> = {};

  ranges.forEach(range => {
    percentileValues[range.label] = {
      min: calculatePercentile(numArray, range.min),
      max: calculatePercentile(numArray, range.max)
    };
  });

  return percentileValues;
}

// Chart 4.2
function calculateProbabilityRanges(simulationRecords: Record<number, AnnualResults[]>, selectedQuantity: 'totalInvestments' | 'totalIncome' | 'totalExpenses' | 'earlyWithdrawalTax' | 'discretionaryExpensesPercentage') {
  const years: number[] = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  const results: ProbabilityRangesResult[] = [];

  if (selectedQuantity == "totalInvestments") {
    let numArray: number[] = []
    for (const year of years) {
      const yearResults = simulationRecords[year];
      for (const result of yearResults) {
        const investmentValues = Object.values(result.investmentBreakdown).map(inv => inv.value);
        numArray.push(...investmentValues);
      }
      numArray.sort((a, b) => a - b);
      const median = calculatePercentile(numArray, 50);

      results.push({
        year: year,
        selectedQuantity: selectedQuantity,
        median: median,
        percentileValues: calculateRanges(numArray),
      })
    }
  }
  else if (selectedQuantity == "totalIncome") {
    let numArray: number[] = []
    for (const year of years) {
      const yearResults = simulationRecords[year];
      for (const result of yearResults) {
        const incomeValues = Object.values(result.incomeBreakdown);
        numArray.push(...incomeValues);
      }
      numArray.sort((a, b) => a - b);
      const median = calculatePercentile(numArray, 50);

      results.push({
        year: year,
        selectedQuantity: selectedQuantity,
        median: median,
        percentileValues: calculateRanges(numArray),
      })
    }
  }
  else if (selectedQuantity == "totalExpenses") {
    let numArray: number[] = []
    for (const year of years) {
      const yearResults = simulationRecords[year];
      for (const result of yearResults) {
        const expenseValues = Object.values(result.expenseBreakdown);
        numArray.push(...expenseValues);
      }
      numArray.sort((a, b) => a - b);
      const median = calculatePercentile(numArray, 50);

      results.push({
        year: year,
        selectedQuantity: selectedQuantity,
        median: median,
        percentileValues: calculateRanges(numArray),
      })
    }
  }
  else if (selectedQuantity == "earlyWithdrawalTax") {
    let numArray: number[] = []
    // Looping through a range of years
    for (const year of years) {
      const yearResults = simulationRecords[year];
      // Each year has at least one result because there could be multiple simulations
      for (const result of yearResults) {
        numArray.push(result.earlyWithdrawalTax);
      }
      numArray.sort((a, b) => a - b);
      const median = calculatePercentile(numArray, 50);

      results.push({
        year: year,
        selectedQuantity: selectedQuantity,
        median: median,
        percentileValues: calculateRanges(numArray),
      })
    }
  }
  else if (selectedQuantity == "discretionaryExpensesPercentage") {
    let numArray: number[] = []
    for (const year of years) {
      const yearResults = simulationRecords[year];
      for (const result of yearResults) {
        numArray.push(result.percentageOfTotalDiscretionaryExpenses);
      }
      numArray.sort((a, b) => a - b);
      const median = calculatePercentile(numArray, 50);

      results.push({
        year: year,
        selectedQuantity: selectedQuantity,
        median: median,
        percentileValues: calculateRanges(numArray),
      })
    }
  }
  else {
    throw new Error("Undefined Quantity");
  }
}

function calculateStackBarInvestmentData(simulationRecords: Record<number, AnnualResults[]>, aggregationThreshold: number, useMedian: boolean) {
  const years: number[] = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  for (const year of years) {
    const yearResults = simulationRecords[year];
    
  }
}

// Chart 4.3
function calculateStackBarData(simulationRecords: Record<number, AnnualResults[]>,
  selectedQuantity: 'investments' | 'income' | 'expenses', aggregationThreshold: number, useMedian: boolean) {

  }

// Chart 5.1


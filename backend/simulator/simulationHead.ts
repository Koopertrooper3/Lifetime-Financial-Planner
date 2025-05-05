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
import { numericalExploration, Result, RothExploration, AnnualResults } from './simulatorInterfaces';
import { SuccessProbabiltyChartModel } from '../db/charts_schema/SuccessProbabilitySchema';
import { ProbabilityRangeChartModel } from '../db/charts_schema/ProbabilityRangeChartSchema';
import { StackBarDataModel } from '../db/charts_schema/StackBarDataSchema';
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
  explorationNumber: 0,
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
        explorationNumber: 0, 
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
  console.log("Done");
  await saveProbabilityData(job.data.userID, job.data.scenarioID, String(job.data.totalSimulations), combinedResult.simulationRecords);
  await saveProbabilityRangeChartData(job.data.userID, job.data.scenarioID, String(job.data.totalSimulations), combinedResult.simulationRecords);
  await saveStackBarData(job.data.userID, job.data.scenarioID, String(job.data.totalSimulations), combinedResult.simulationRecords);

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

        scenarioVariations.forEach((scenarioVariation,index) =>{
          const workerData = {
            username: user?.name || "",
            scenarioID : jobData.scenarioID, 
            explorationNumber: index, 
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

      const targetEvent = structuredClone(variationScenario.eventSeries[explorationParameters.eventName])
      if(targetEvent == undefined){
        throw new Error("No invest event to parameterize")
      }
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
      variationScenario.eventSeries[explorationParameters.eventName] = targetEvent
      scenarioVariations.push(variationScenario)
    })
  }else{
    throw new Error("Undefined exploration parameter type")
  }

  console.log(scenarioVariations);
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

// ========================= Chart 4.1 ==========================
function calculateProbabilityOfSuccess(simulationRecords : Record<number,AnnualResults[]>) {
  // Just to make sure that the years are sorted in order
  const years: number[] = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  const results: { year: number; successRate: number; }[] = [];
  let numSimulations = 0;

  for (const year of years) {
    const yearResults = simulationRecords[year];
    let successCount = 0;
    numSimulations = yearResults.length;
    for (let i = 0; i < numSimulations; i++) {
      const financialGoal = yearResults[i].finanicalGoal;
      if (financialGoal) {
        successCount += 1;
      }
    }

    const successRate = (successCount / numSimulations);

    results.push({
      year,
      successRate
    });
  }

  return results;
}

async function saveProbabilityData(
  userId: string,
  scenarioId: string,
  numScenario: string,
  simulationRecords : Record<number,AnnualResults[]>
) {
  const probabilities = calculateProbabilityOfSuccess(simulationRecords)

  try {
    // Create new document
    const doc = new SuccessProbabiltyChartModel({
      chartID: `${userId}${scenarioId}${numScenario}`,
      probabilities: probabilities
    });

    // Save to database
    const savedDoc = await doc.save();
    console.log('Success probability data saved successfully:', savedDoc._id);
    return savedDoc;
  } catch (error) {
    console.error('Error saving success probability:', error);
    throw new Error('Failed to save probability data');
  }
}

// ========================= Chart 4.2 ==========================
interface AnnualMetric {
  median: number;
  ranges: {
    "10-90": [number, number];
    "20-80": [number, number];
    "30-70": [number, number];
    "40-60": [number, number];
  };
}

type Range = [number, number];

interface ShadedLineChart {
  yearlyResults: Record<string, Record<string, AnnualMetric>>;
};

// Helper function to calculate percentiles
function calculatePercentile(sortedValues: number[], percentile: number) {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  
  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }
  
  return sortedValues[lowerIndex] + 
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * (index - lowerIndex);
}

// Helper to extract values based on selected quantity
function collectValues(
  results: AnnualResults[],
  quantity: string
): number[] {
  return results.flatMap(result => {
    switch (quantity) {
      case 'totalInvestments':
        return Object.values(result.investmentBreakdown).map(inv => inv.value);
      case 'totalIncome':
        return Object.values(result.incomeBreakdown);
      case 'totalExpenses':
        return Object.values(result.expenseBreakdown);
      case 'earlyWithdrawalTax':
        return [result.earlyWithdrawalTax ?? 0];
      case 'discretionaryExpensesPercentage':
        return [result.percentageOfTotalDiscretionaryExpenses ?? 0];
      default:
        return [];
    }
  });
}

function calculateProbabilityRanges(simulationRecords: Record<number, AnnualResults[]>) {
  const years: number[] = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  const results: ShadedLineChart = {
    yearlyResults: {},
  };

  const quantities = [
    'totalInvestments',
    'totalIncome',
    'totalExpenses',
    'earlyWithdrawalTax',
    'discretionaryExpensesPercentage'
  ] as const;

  for (const year of years) {
    const yearlyResults = simulationRecords[year];
    const processedYearlyResults: Record<string, AnnualMetric> = {};
    for (const quantity of quantities) {
      const values = collectValues(yearlyResults, quantity);
      const sorted = [...values].sort((a, b) => a - b);
      const median = calculatePercentile(sorted, 50);
      processedYearlyResults[quantity] = {
        median: median,
        ranges: {
          "10-90": [calculatePercentile(sorted, 10), calculatePercentile(sorted, 90)],
          "20-80": [calculatePercentile(sorted, 20), calculatePercentile(sorted, 80)],
          "30-70": [calculatePercentile(sorted, 30), calculatePercentile(sorted, 70)],
          "40-60": [calculatePercentile(sorted, 40), calculatePercentile(sorted, 60)]
        }
      };
    }
    results.yearlyResults[String(year)] = processedYearlyResults;
  }

  return results;
}

async function saveProbabilityRangeChartData(
  userId: string,
  scenarioId: string,
  numScenario: string,
  simulationRecords: Record<number, AnnualResults[]>
) {
  const results = calculateProbabilityRanges(simulationRecords);

  try {
    const doc = new ProbabilityRangeChartModel({
      chartID: `${userId}${scenarioId}${numScenario}`,
      results
    });

    const savedDoc = await doc.save();
    console.log('Probability range chart data saved successfully:', savedDoc._id);
    return savedDoc;
  } catch (error) {
    console.error('Error saving range chart data:', error);
    throw new Error('Failed to save range chart data');
  }
}

// ========================= Chart 4.3 ==========================

function calculateMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

function calculateAverage(values: number[]): number {
  if (!values.length) return 0;
  let sum = 0;
  for (let num of values) {
    sum += num;
  }
  return sum / values.length;
}

function calculateStackBarData(
  simulationRecords: Record<number, AnnualResults[]>
): Record<string, {
  average: {
    investments: Record<string, number>;
    income: Record<string, number>;
    expenses: Record<string, number>;
  },
  median: {
    investments: Record<string, number>;
    income: Record<string, number>;
    expenses: Record<string, number>;
  }
}> {
  const years = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  // Initialize an empty object to store the final aggregated data.
  const result: Record<string, {
    average: {
      investments: Record<string, number>;
      income: Record<string, number>;
      expenses: Record<string, number>;
    },
    median: {
      investments: Record<string, number>;
      income: Record<string, number>;
      expenses: Record<string, number>;
    }
  }> = {};

  for (const year of years) {
    const yearResults = simulationRecords[year];
    // The string is the investment/income/expense name and number[] stores all the investment/income/expense values for that particular segment throughout a set of simulations for a single year 
    const allValues = {
      investments: {} as Record<string, { values: number[]; taxStatus: string }>,
      income: {} as Record<string, { values: number[] }>,
      expenses: {} as Record<string, { values: number[] }>
    };

    // Collect all the values for all segments across the set of simulations in each year
    for (const result of yearResults) {
      for (const [name, data] of Object.entries(result.investmentBreakdown || {})) {
        const key = `${name}_${data.taxStatus}`;
        allValues.investments[key] = allValues.investments[key] || { values: [], taxStatus: data.taxStatus };
        allValues.investments[key].values.push(data.value);
      }
      for (const [name, value] of Object.entries(result.incomeBreakdown || {})) {
        if (!allValues.income[name]) {
          allValues.income[name] = { values: []};
        }
        allValues.income[name].values.push(value);
      }
      for (const [name, value] of Object.entries(result.expenseBreakdown || {})) {
        if (!allValues.expenses[name]) {
          allValues.expenses[name] = { values: []};
        }
        allValues.expenses[name].values.push(value);
      }
    }
    
    // Aggregation
    const yearlyResult = {
      average: {
        investments: {} as Record<string, number>,
        income: {} as Record<string, number>,
        expenses: {} as Record<string, number>
      },
      median: {
        investments: {} as Record<string, number>,
        income: {} as Record<string, number>,
        expenses: {} as Record<string, number>
      }
    };

    // Sort investments by tax status
    const investmentEntries = Object.entries(allValues.investments);
    investmentEntries.sort((a, b) => a[1].taxStatus.localeCompare(b[1].taxStatus));

    // First pass: Calculate all values and sum the "Other" categories
    for (const [key, data] of investmentEntries) {
      const avgValue = calculateAverage(data.values);
      const medianValue = calculateMedian(data.values);
      
      yearlyResult.average.investments[`${key.split('_')[0]} (${data.taxStatus})`] = avgValue;
      yearlyResult.median.investments[`${key.split('_')[0]} (${data.taxStatus})`] = medianValue;
    }

    for (const [name, data] of Object.entries(allValues.income)) {
      const avgValue = calculateAverage(data.values);
      const medianValue = calculateMedian(data.values);
      
      yearlyResult.average.income[name] = avgValue;
      yearlyResult.median.income[name] = medianValue;
    }

    for (const [name, data] of Object.entries(allValues.expenses)) {
      const avgValue = calculateAverage(data.values);
      const medianValue = calculateMedian(data.values);
      
      yearlyResult.average.expenses[name] = avgValue;
      yearlyResult.median.expenses[name] = medianValue;
    }

    result[year.toString()] = yearlyResult;
  }

  return result;
}

async function saveStackBarData(
  userId: string,
  scenarioId: string,
  numScenario: string,
  simulationRecords: Record<number, AnnualResults[]>
) {
  const yearlyResults = calculateStackBarData(simulationRecords);

  try {
    const doc = new StackBarDataModel({
      chartID: `${userId}${scenarioId}${numScenario}`,
      yearlyResults,
    });

    const savedDoc = await doc.save();
    console.log('Stack Bar Data saved successfully:', savedDoc._id);
    return savedDoc;
  } catch (error) {
    console.error('Error saving stack bar data:', error);
    throw new Error('Failed to save stack bar data');
  }
}

// ========================= Chart 5.1 ==========================
function calculateMultiLineChartData(explorationParam: RothExploration, selectedQuantity: 'successProbability' | 'medianInvestments') {

}


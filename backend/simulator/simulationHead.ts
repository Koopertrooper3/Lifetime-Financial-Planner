import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import path from 'path';
import mongoose from 'mongoose';
import {Scenario, scenarioModel} from '../db/Scenario';
import * as dotenv from 'dotenv';
import { StateTaxBracket, stateTaxParser } from '../state_taxes/statetax_parser';
import { federalTaxModel } from '../db/taxes';
import User from '../db/User';
import { pool } from 'workerpool';

dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')});

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

const connection = new IORedis({ maxRetriesPerRequest: null });
const MAX_THREADS = Number(process.env.MAX_THREADS) || 1

const redisWorker = new Worker("simulatorQueue",simulationManager,{connection});
const simulatorPool = pool(__dirname + '/simulationWorker.js',{
  maxWorkers: MAX_THREADS
});

console.log("database connection string")
console.log(databaseConnectionString)
mongoose.connect(databaseConnectionString)

interface queueData {
  userID: string,
  scenarioID : string;
  totalSimulations: number;
}

interface Result {
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
  //Collect tax information
  const taxYear = new Date().getFullYear()-1;
  const federalTax = await federalTaxModel.findOne({year: taxYear}).lean()
  const stateTaxes : StateTaxBracket[] = stateTaxParser()
  const user = await User.findById(jobData.userID);

  const threadArray : Promise<Result>[] = []
  // for(let threads = 0; threads < MAX_THREADS; threads++){
  //   const workerData = {
  //     username: user?.name,
  //     scenarioID : jobData.scenarioID, 
  //     threadNumber: threads, 
  //     simulationsPerThread: simulationsPerThread,
  //     scenario: scenario,
  //     federalTaxes : federalTax,
  //     stateTaxes: stateTaxes
  //   }

  //   threadArray.push(new Promise((resolve) => {
  //     const workerThread = new WorkerThreads.Worker(path.resolve(__dirname, './simulationWorker.js'),{workerData : workerData})
  //     workerThread.on('message',(message : Result)=>{
  //       console.log("resolved")
  //       resolve(message)
  //     })
  //     workerThread.on('error',(err)=>{
  //       console.log("error")
  //       console.log(err)
  //       resolve({completed : 0, succeeded: 0, failed: 0})
  //     })
  //     workerThread.on('exit',(exitcode)=>{
  //       if(exitcode == 1){
  //         resolve({completed : 0, succeeded: 0, failed: 0})
  //       }
  //     })

  //   }))
    
  // }

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

  const finalResult : Result = {completed : 0, succeeded: 0, failed: 0}
  const jobMessages = await Promise.all(threadArray)

  for(const finalMessage of jobMessages){
    finalResult['completed'] += finalMessage['completed']
    finalResult['succeeded'] += finalMessage['succeeded']
    finalResult['failed'] += finalMessage['failed']
  }
  console.log(jobData)

  return finalResult
}

redisWorker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

redisWorker.on('error', err => {
  // log the error
  console.error(err);
});
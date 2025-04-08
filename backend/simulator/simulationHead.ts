/* eslint-disable @typescript-eslint/no-unused-vars */
import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import path from 'path';
import mongoose from 'mongoose';
import {Scenario, scenarioModel} from '../db/Scenario';
import * as dotenv from 'dotenv';
import { stateTax, stateTaxParser } from '../state_taxes/statetax_parser';
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
const TOTAL_NUMBER_OF_SIMULATIONS = Number(process.env.TOTAL_NUMBER_OF_SIMULATIONS) || 1

const redisWorker = new Worker("simulatorQueue",simulationManager,{connection});
const simulatorPool = pool(__dirname + '/simulationWorker.js',{
  maxWorkers: 1
});

console.log("database connection string")
console.log(databaseConnectionString)
mongoose.connect(databaseConnectionString)

interface queueData {
  userID: string,
  scenarioID : string;
}

interface Result {
  completed: number,
  succeeded: number,
  failed: number,
}


async function simulationManager(job: Job) {
  console.log("New Job")
  const jobData : queueData = job.data
  const totalSimulations = TOTAL_NUMBER_OF_SIMULATIONS


  const scenario : Scenario | null = await scenarioModel.findById(jobData.scenarioID).lean();
  //Collect tax information
  const taxYear = new Date().getFullYear()-1;
  const federalTax = await federalTaxModel.findOne({year: taxYear}).lean()
  const stateTaxes : stateTax[] = stateTaxParser()
  const user = await User.findById(jobData.userID);

  const workerData = {
        username: user?.name,
        scenarioID : jobData.scenarioID, 
        scenario: scenario,
        federalTaxes : federalTax,
        stateTaxes: stateTaxes
      }
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

  for(let jobs = 0; jobs < totalSimulations; jobs++){
    const workerData = {
          username: user?.name,
          scenarioID : jobData.scenarioID, 
          threadNumber: jobs, 
          simulationsPerThread: totalSimulations,
          scenario: scenario,
          federalTaxes : federalTax,
          stateTaxes: stateTaxes
      }

    threadArray.push(new Promise((resolve) => {
          
        simulatorPool.exec('simulation',[workerData]).then(
          (simulationResult : Result) =>{
            resolve(simulationResult)
          }
        ).catch(
          (error) =>{
            console.log(error)
          }
        )
    
      }))
    
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
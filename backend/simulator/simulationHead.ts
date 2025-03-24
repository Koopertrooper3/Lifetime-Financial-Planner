import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import * as WorkerThreads from 'worker_threads';
import path from 'path';
import mongoose from 'mongoose';
import {Scenario, scenarioModel} from '../db/Scenario';
import * as dotenv from 'dotenv';
dotenv.config();

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

const connection = new IORedis({ maxRetriesPerRequest: null });
const MAX_THREADS = Number(process.env.THREADS_PER_ATTEMPT) || 1
const TOTAL_NUMBER_OF_SIMULATIONS = Number(process.env.TOTAL_NUMBER_OF_SIMULATIONS) || 1

const worker = new Worker("simulatorQueue",simulation,{connection});
console.log("database connection string")
console.log(databaseConnectionString)
const dbconnection = mongoose.connect(databaseConnectionString)
interface queue {
  scenarioID : string;
}

interface Result {
  completed: number,
  succeeded: number,
  failed: number,
}
async function simulation(job: Job) {
  console.log("New Job")
  const jobData : queue = job.data
  const simulationsPerThread = TOTAL_NUMBER_OF_SIMULATIONS/MAX_THREADS


  const scenario : Scenario | null = await scenarioModel.findById(jobData.scenarioID).lean();

  const threadArray : Promise<Result>[] = []
  for(let threads = 0; threads < MAX_THREADS; threads++){
    const workerData = {
      scenarioID : jobData.scenarioID, 
      threadNumber: threads, 
      simulationsPerThread: simulationsPerThread,
      scenario: scenario
    }
    threadArray.push(new Promise((resolve) => {
      const workerThread = new WorkerThreads.Worker(path.resolve(__dirname, './simulationWorker.js'),{workerData : workerData})
      workerThread.on('message',(message : Result)=>{
        console.log("resolved")
        resolve(message)
      })
      workerThread.on('error',(err)=>{
        console.log("error")
        console.log(err)
        resolve({completed : 0, succeeded: 0, failed: 0})
      })
      workerThread.on('exit',(exitcode)=>{
        if(exitcode == 1){
          resolve({completed : 0, succeeded: 0, failed: 0})
        }
      })

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

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('error', err => {
  // log the error
  console.error(err);
});
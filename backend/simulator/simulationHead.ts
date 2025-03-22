import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import * as WorkerThreads from 'worker_threads';
import path from 'path';


const connection = new IORedis({ maxRetriesPerRequest: null });
const MAX_THREADS = Number(process.env.THREADS_PER_ATTEMPT) || 1
const TOTAL_NUMBER_OF_SIMULATIONS = Number(process.env.TOTAL_NUMBER_OF_SIMULATIONS) || 1

const worker = new Worker("simulatorQueue",simulation,{connection});

interface queue {
  scenarioID : string;
}

async function simulation(job: Job) {
  const jobData : queue = job.data
  const simulationsPerThread = TOTAL_NUMBER_OF_SIMULATIONS/MAX_THREADS


  for(let threads = 0; threads < MAX_THREADS; threads++){
    const workerData = {
      scenarioID : jobData.scenarioID, 
      threadNumber: threads, 
      sumulationsPerThread: simulationsPerThread
    }
    const workerThread = new WorkerThreads.Worker(path.resolve(__dirname, './simulationWorker.js'),{workerData : workerData})
    workerThread.on('exit',(code) => console.log(code))
  }

  
  console.log(jobData)

  return
}

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('error', err => {
  // log the error
  console.error(err);
});
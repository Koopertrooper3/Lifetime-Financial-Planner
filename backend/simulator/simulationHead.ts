import {Worker, Job} from 'bullmq'
import IORedis from 'ioredis';
import * as WorkerThreads from 'worker_threads';
import path from 'path';


const connection = new IORedis({ maxRetriesPerRequest: null });
const MAX_THREADS = 2

const worker = new Worker("simulatorQueue",simulation,{connection});

interface queue {
  scenarioID : string;
}

async function simulation(job: Job) {
  const jobData : queue = job.data
  

  for(let threads = 0; threads < MAX_THREADS; threads++){
    new WorkerThreads.Worker(path.resolve(__dirname, './simulationWorker.ts'),{workerData : {scenarioID : jobData.scenarioID}})
  }

  console.log(jobData)

  return

}

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});
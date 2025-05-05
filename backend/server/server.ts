/*global console, setTimeout, clearTimeout, __dirname*/
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import process from 'node:process';
import {federalTaxModel} from '../db/taxes';
import {federalTaxScraper} from '../scraper/taxScraper';
import { Queue, QueueEvents } from 'bullmq';
import app from './app';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')});

const port : number = Number(process.env.BACKEND_PORT) || 8080;
const ip = process.env.BACKEND_IP || "0.0.0.0";
const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName
const REDIS_HOST = process.env.REDIS_HOST || "localhost"
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379

export let simulatorQueue : Queue
export let simulatorQueueEvents : QueueEvents
export let explorationQueue : Queue
export let explorationQueueEvents : QueueEvents

//Startup code to be run before the server starts
async function startUp(){
    //Open a connection to mongodb
    await mongoose.connect(databaseConnectionString);
    //Query if we have the current tax year, if we do not run the scraper

    const currentTaxYear = new Date().getFullYear()-1;

    federalTaxModel.findOne({ year: currentTaxYear }).lean().then(async (taxData)=>{
        if(!taxData){
            console.log(`Tax data for the year ${currentTaxYear} not found. Running the scraper...`);
            await federalTaxScraper();
        }else{
            console.log(`Tax data for the year ${currentTaxYear} is already in the database.`);
        }
    });

    simulatorQueue = new Queue('simulatorQueue', {
        connection: {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
      });

    explorationQueue = new Queue('scenarioExplorationQueue', {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    });
    
    simulatorQueueEvents = new QueueEvents('simulatorQueue', {
        connection: {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
      });

      explorationQueueEvents = new QueueEvents('scenarioExplorationQueue', {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    });


    return
}

startUp().then(()=>{
    const server = app.listen(port, ip, ()=>{
        console.log(`Server listening on ip:${ip}, port:${port}`);
    });
    //gracefully handle server close on SIGINT(CTRL+C) by waiting for remaining request to finish
    process.on('SIGINT', ()=>{
        console.log("Server is now closing...");

        //timer to force server to shutdown even if there are active connections
        const timerShutDown = setTimeout(()=>{
            console.log("Forcibly ending existing connection...");
            process.exit(0);
        }, 3000);

        server.close(()=>{
            clearTimeout(timerShutDown);
            console.log("Server is now closed");
            process.exit(0)
        });
});
})

// async () => {scraper.federalIncomeTaxScraper()}
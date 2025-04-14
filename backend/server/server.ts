/*global console, setTimeout, clearTimeout, __dirname*/
/*eslint no-undef: "error"*/

import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import process from 'node:process';
import {federalTaxModel} from '../db/taxes';
import {federalTaxScraper} from '../scraper/taxScraper';
import { Queue, QueueEvents } from 'bullmq';
import bodyParser from 'body-parser';
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
const jsonParser = bodyParser.json()

let simulatorQueue : Queue
let queueEvents : QueueEvents


//Startup code to be run before the server starts
async function startUp(){
    //Open a connection to mongodb
    await mongoose.connect(databaseConnectionString);
    //Query if we have the current tax year, if we do not run the scraper
    //TP: Code below created with Github Copilot with the prompt 
    //"Create a mongoose query that queries the federalTaxModel to check if the current tax year's information is in the database."
    //Code was outdated and replaced with the code below
    // const currentTaxYear = new Date().getFullYear()-1;

    // federalTaxModel.findOne({ year: currentTaxYear }, (err: unknown, taxData: unknown) => {
    //     if (err) {
    //         console.error('Error querying the database:', err);
    //         return;
    //     }
    //     if (!taxData) {
    //         console.log(`Tax data for the year ${currentTaxYear} not found. Running the scraper...`);
    //         // Call the scraper function here
    //         federalTaxScraper();
    //     } else {
    //         console.log(`Tax data for the year ${currentTaxYear} is already in the database.`);
    //     }
    // });


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
    
    queueEvents = new QueueEvents('simulatorQueue', {
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

/**
 * PLEASE DO NOT PUT ANY ROUTES FROM FRONTEND IN THIS FILE, WRITE THEM IN /routers and export to app.ts
 */
//sample GET
app.get("/", (req, res)=>{
    res.send("yeah");
});

app.post("/scenario/taxes/import", (req, res)=>{
    res.send("yeah");
});

interface runSimulationBody{
    userID: string,
    scenarioID: string
    totalSimulations: number
}
app.post("/scenario/runsimulation", jsonParser , async (req : Request, res : Response)=>{
    try{
        console.log("Job request")
        const requestBody : runSimulationBody = req.body
        const job = await simulatorQueue.add("simulatorQueue", {userID: requestBody.userID, scenarioID : requestBody.scenarioID, totalSimulations : requestBody.totalSimulations},{ removeOnComplete: true, removeOnFail: true })

        //const result = await job.waitUntilFinished(queueEvents,1000*60*1)
        res.status(200).send({completed : 1, succeeded: 0, failed: 0})
    }catch(err){
        console.log((err as Error))
    }
    
});
// async () => {scraper.federalIncomeTaxScraper()}
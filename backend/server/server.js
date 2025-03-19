/*global console, setTimeout, clearTimeout*/
/*eslint no-undef: "error"*/

import express from 'express'
import 'dotenv/config';
import mongoose from 'mongoose';
import process from 'process';
import {federalTaxModel} from './../db/taxes.js'
import {federalTaxScraper} from './../scraper/taxScraper.js'

const app = express();
const port = process.env.BACKEND_PORT;
const ip = process.env.BACKEND_IP;
const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

let server;

//Startup code
async function startUp(){
    //Open a connection to mongodb
    await mongoose.connect(databaseConnectionString);

    //Query if we have the current tax year, if we do not run the scraper
    //TP: Code below created with Github Copilot with the prompt 
    //"Create a mongoose query that queries the federalTaxModel to check if the current tax year's information is in the database."
    const currentTaxYear = new Date().getFullYear()-1;

    federalTaxModel.findOne({ year: currentTaxYear }, (err, taxData) => {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }
        if (!taxData) {
            console.log(`Tax data for the year ${currentTaxYear} not found. Running the scraper...`);
            // Call the scraper function here
            federalTaxScraper();
        } else {
            console.log(`Tax data for the year ${currentTaxYear} is already in the database.`);
        }
    });
    //Start up simulator process
}

startUp().then(()=>{
    server = app.listen(port, ip, ()=>{
        console.log(`Server listening on ip:${ip}, port:${port}`);
    });
    
})

//gracefully handle server close on SIGINT(CTRL+C) by waiting for remaining request to finish
process.once('SIGINT', ()=>{
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

//sample GET
app.get("/", (req, res)=>{
    res.send("yeah");
});

// async () => {scraper.federalIncomeTaxScraper()}
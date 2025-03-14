// import scraper from "./../scraper/taxScraper.js"
import express from 'express'
import 'dotenv/config';

const app = express();
const port = process.env.BACKEND_PORT;
const ip = process.env.BACKEND_IP;

//start the server
const server = app.listen(port, ip, ()=>{
    console.log(`Server listening on ip:${ip}, port:${port}`);
});

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
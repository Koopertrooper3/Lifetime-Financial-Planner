/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from "fs"
import mongoose from "mongoose"
import path from "path"
import { finished } from "stream/promises"
import { workerData } from "worker_threads"
import {Scenario} from "../db/Scenario"
const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

//Logging function, might replace with redis queue
function logMessage(threadNumber: string, message : string){
    return `[Thread ${threadNumber}] ` + message + "\n"
}
function pushToLog(logStream : WriteStream, message : string){
    logStream.write(message)
}

interface threadData {
    scenarioID : string, 
    threadNumber: number
    totalSimulations: number
}

async function main(){
    const test = await mongoose.connect(databaseConnectionString)
    const logStream = createWriteStream(path.resolve(__dirname, 'simulator.log'), {flags: 'a'})

    const threadData : threadData = workerData

    const scenarioID : string = threadData.scenarioID
    const threadNumber : string = threadData.threadNumber.toString()
    const totalSimulations : number = threadData.totalSimulations

    const scenario = await Scenario.findById(scenarioID);

    for(let simulation = 0; simulation < totalSimulations; simulation++){
        console.log("simulation!")
    }

    pushToLog(logStream,logMessage(threadNumber,scenarioID))

    logStream.close()
    return logStream
}

main().then(async (stream) =>{
    await finished(stream)
    process.exit()
})

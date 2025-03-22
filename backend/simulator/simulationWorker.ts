/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from "fs"
import mongoose from "mongoose"
import path from "path"
import { finished } from "stream/promises"
import { workerData, parentPort } from "worker_threads"
import {scenarioModel, Scenario} from "../db/Scenario"
import { rnorm, rint } from "probability-distributions"
import InvestmentType from "../db/InvestmentTypes"
import { Investment } from "../db/InvestmentSchema"

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName


//String generator functions
function simulationStartLogMessage(scenarioID: string){
    return `Starting simulation for scenario with id: ${scenarioID}`
}
function lifeExpectancyLogMessage(lifeExpectancy: number){
    return `Life Expectancy: ${lifeExpectancy}`
}
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

interface Result{
    success: number
    failure: number
}
async function main(){
    const test = await mongoose.connect(databaseConnectionString)
    const logStream = createWriteStream(path.resolve(__dirname, 'simulator.log'), {flags: 'a'})

    const threadData : threadData = workerData

    const scenarioID : string = threadData.scenarioID
    const threadNumber : string = threadData.threadNumber.toString()
    const totalSimulations : number = threadData.totalSimulations

    const scenario : Scenario | null = await scenarioModel.findById(scenarioID).lean();
    
    if(scenario == null){
        //Error log message to be added
        throw new Error("Scenario does not exist")
    }

    pushToLog(logStream,logMessage(threadNumber,simulationStartLogMessage(scenarioID)))

    const lifeExpectancy : number = calculateLifeExpectancy(scenario)

    pushToLog(logStream,logMessage(threadNumber,lifeExpectancyLogMessage(lifeExpectancy)))

    const result : Result = {success: 0, failure: 0}

    for(let simulation = 0; simulation < totalSimulations; simulation++){

        let previousYearIncome = 0
        for(let year = 0; year < lifeExpectancy; year++){

            let currentYearIncome = 0
            let currentYearSocialSecurityIncome = 0
            let inflationRate = calculateInflation(scenario)


            //TODO: Calculate brackets after inflation

            //TODO: Calculate annual limits on retirement account contributions after inflation

            //Income events
            const cash : Investment = scenario.investments.filter((investment) => investment.id == "cash")[0]
            const incomeEvents = scenario.eventSeries.filter((object) => object.event.type == "Income")

            for(const incomeEvent of incomeEvents){
                if(incomeEvent.event.type == "Income"){

                    let eventIncome = incomeEvent.event.initalAmount


                    cash.value += eventIncome
                    currentYearIncome += eventIncome

                    if(incomeEvent.event.socialSecurity == true){
                        currentYearSocialSecurityIncome += incomeEvent.event.initalAmount
                    }

                    //Inflation adjustment
                    if(incomeEvent.event.inflationAdjusted == true){
                        incomeEvent.event.initalAmount += incomeEvent.event.initalAmount * inflationRate
                    }

                    
                }

                
            }

            cash.value += currentYearIncome

        }
    }

    
    logStream.close()
    parentPort?.postMessage({result: result})
    return logStream
}

function calculateLifeExpectancy(scenario : Scenario){
    const userLifeExpectancy = scenario.lifeExpectancy[0]
    if(userLifeExpectancy.type == "Fixed"){
        return userLifeExpectancy.value
    }else if(userLifeExpectancy.type == "Normal"){
        return Math.round(rnorm(1,userLifeExpectancy.mean,userLifeExpectancy.stdev)[0])
    }else{
        return rint(1,userLifeExpectancy.lower,userLifeExpectancy.upper, 1)[0]
    }
}
function calculateInflation(scenario : Scenario){
    const inflationAssumption = scenario.inflationAssumption
    if(inflationAssumption.type == "Fixed"){
        return inflationAssumption.value
    }else if(inflationAssumption.type == "Normal"){
        return rnorm(1,inflationAssumption.mean,inflationAssumption.stdev)[0]
    }else{
        return rint(1,inflationAssumption.lower,inflationAssumption.upper, 1)[0]
    }
}

main().then(async () =>{
    process.exit(0)
}).catch(async (err) =>{
    process.exit(1)
})

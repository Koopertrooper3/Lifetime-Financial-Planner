/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from "fs"
import mongoose from "mongoose"
import path from "path"
import { finished } from "stream/promises"
import { workerData, parentPort } from "worker_threads"
import {scenarioModel, Scenario} from "../db/Scenario"
import { rnorm, rint } from "probability-distributions"
import { Investment } from "../db/InvestmentSchema"
import { FederalTax } from "../db/taxes"
import {stateTax, stateTaxParser} from "../state_taxes/statetax_parser"
import { worker } from 'workerpool'

//String generator functions
function simulationStartLogMessage(scenarioID: string){
    return `Starting simulation for scenario with id: ${scenarioID}`
}
function lifeExpectancyLogMessage(lifeExpectancy: number){
    return `Life Expectancy: ${lifeExpectancy}`
}
function incomeEventLogMessage(year : number, eventName: string, amount : number){
    return `[Income] Year: ${year}, Amount: ${amount}, Event name: ${eventName}`
}
function logMessage(threadNumber: string, message : string){
    return `[Thread ${threadNumber}] ` + message + "\n"
}
function pushToLog(logStream : WriteStream, message : string){
    logStream.write(message)
}

interface threadData {
    username: string,
    scenarioID : string, 
    threadNumber: number
    simulationsPerThread: number,
    scenario: Scenario,
    federalTaxes : FederalTax,
    stateTaxes: stateTax
}

interface Result{
    completed: number,
    succeeded: number,
    failed: number,
  }

async function simulation(threadData : threadData){
    const result : Result = {completed : 0, succeeded: 0, failed: 0}
    
 
    const startTime = new Date();
    const dateTimeString = `${startTime.getMonth()}_${startTime.getDay()}_${startTime.getFullYear()}_${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`
    const logStream = createWriteStream(path.resolve(__dirname, '..','..','logs',`${threadData.username}_${dateTimeString}.log`), {flags: 'a'})

    const scenarioID : string = threadData.scenarioID
    const threadNumber : string = threadData.threadNumber.toString()
    const totalSimulations : number = threadData.simulationsPerThread
    const scenario : Scenario = threadData.scenario
    
    if(scenario == null){
        //Error log message to be added
        logStream.close()
        return result
    }

    //pushToLog(logStream,logMessage(threadNumber,simulationStartLogMessage(scenarioID)))

    const lifeExpectancy : number = calculateLifeExpectancy(scenario)
    const userBirthyear = scenario.birthYear[0]
    //pushToLog(logStream,logMessage(threadNumber,lifeExpectancyLogMessage(lifeExpectancy)))
    
    console.log("Starting")
    const startingYear = new Date().getFullYear();
    for(let simulation = 0; simulation < totalSimulations; simulation++){
        let simulatedYear = new Date().getFullYear();

        let previousYearIncome = 0
    
        for(let age = startingYear - userBirthyear; age < lifeExpectancy; age++){
            let currentYearIncome = 0
            let currentYearSocialSecurityIncome = 0
            const inflationRate = calculateInflation(scenario)


            //TODO: Calculate brackets after inflation

            //TODO: Calculate annual limits on retirement account contributions after inflation

            //Income events
            const cash : Investment = scenario.investments.filter((investment) => investment.id == "cash")[0]
            const incomeEvents = scenario.eventSeries.filter((object) => object.event.type == "Income")

            for(const incomeEvent of incomeEvents){
                if(incomeEvent.event.type == "Income"){

                    const eventIncome = incomeEvent.event.initialAmount

                    cash.value += eventIncome
                    currentYearIncome += eventIncome
                    pushToLog(logStream,logMessage(threadNumber,incomeEventLogMessage(simulatedYear,incomeEvent.name,eventIncome)))

                    if(incomeEvent.event.socialSecurity == true){
                        currentYearSocialSecurityIncome += incomeEvent.event.initialAmount
                    }

                    //Inflation adjustment
                    if(incomeEvent.event.inflationAdjusted == true){
                        incomeEvent.event.initialAmount += incomeEvent.event.initialAmount * inflationRate
                    }

                    
                }

                
            }

            simulatedYear += 1
            previousYearIncome = currentYearIncome
        }
        result['completed'] += 1
    }

    
    logStream.end()
    await finished(logStream)
    return result
}

function calculateLifeExpectancy(scenario : Scenario){
    const userLifeExpectancy = scenario.lifeExpectancy[0]
    if(userLifeExpectancy.type == "Fixed"){
        return userLifeExpectancy.value
    }else if(userLifeExpectancy.type == "Normal"){
        return Math.round(rnorm(1,userLifeExpectancy.mean,userLifeExpectancy.stdev)[0])
    }else{
        return rint(1,userLifeExpectancy.min,userLifeExpectancy.max, 1)[0]
    }
}
function calculateInflation(scenario : Scenario){
    const inflationAssumption = scenario.inflationAssumption
    if(inflationAssumption.type == "Fixed"){
        return inflationAssumption.value
    }else if(inflationAssumption.type == "Normal"){
        return rnorm(1,inflationAssumption.mean,inflationAssumption.stdev)[0]
    }else{
        return rint(1,inflationAssumption.min,inflationAssumption.max, 1)[0]
    }
}

worker({
    simulation : simulation
})
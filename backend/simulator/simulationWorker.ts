/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from "fs"
import path from "path"
import { finished } from "stream/promises"
import {scenarioModel, Scenario} from "../db/Scenario"
import { rnorm, rint } from "probability-distributions"
import { Investment } from "../db/InvestmentSchema"
import { FederalTax } from "../db/taxes"
import {StateTaxBracket, stateTaxParser} from "../state_taxes/statetax_parser"
import { worker } from 'workerpool'
import { Event as ScenarioEvent } from "../db/EventSchema"
import { assert } from "console"
import { EventDistribution } from "../db/EventSchema"
import { RMDScraper } from "../scraper/RMDScraper"
import { InvestmentType, IncomeDistribution, ReturnDistribution } from "../db/InvestmentTypesSchema"
const USER = 0
const SPOUSE = 1

const EVENT_KEY = 0
const EVENT_DATA = 1
//String generator functions
/**
 * Description placeholder
 *
 * @param {number} year 
 * @param {string} eventName 
 * @param {number} amount 
 * @returns {string} 
 */
function incomeEventLogMessage(year : number, eventName: string, amount : number){
    return `[Income] Year: ${year}, Amount: ${amount}, Event name: ${eventName}`
}
/**
 * Description placeholder
 *
 * @param {string} threadNumber 
 * @param {string} message 
 * @returns {string} 
 */
function logMessage(threadNumber: string, message : string){
    return `[Thread ${threadNumber}] ` + message + "\n"
}
/**
 * Description placeholder
 *
 */
function pushToLog(logStream : WriteStream, message : string){
    logStream.write(message)
}

/**
 * Description placeholder
 */
interface threadData {

    username: string,
    scenarioID : string, 
    threadNumber: number
    simulationsPerThread: number,
    scenario: Scenario,
    federalTaxes : FederalTax,
    stateTaxes: StateTaxBracket
}

/**
 * Description placeholder
 *
 */
interface Result{
    completed: number,
    succeeded: number,
    failed: number,
  }

type TaxBracketLevel = "Federal" | "State"

/**
 * Description placeholder
 *
 * @async
 * @param {threadData} threadData 
 * @returns {unknown} 
 */
async function simulation(threadData : threadData){
    const result : Result = {completed : 0, succeeded: 0, failed: 0}
    
 
    const startTime = new Date();
    const dateTimeString = `${startTime.getMonth()}_${startTime.getDay()}_${startTime.getFullYear()}_${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`
    const logStream = createWriteStream(path.resolve(__dirname, '..','..','logs',`${threadData.username}_${dateTimeString}.log`), {flags: 'a'})

    const threadNumber : string = threadData.threadNumber.toString()
    const totalSimulations : number = threadData.simulationsPerThread
    const baseScenario : Scenario = threadData.scenario
    
    if(baseScenario == null){
        //Error log message to be added
        logStream.close()
        return result
    }

    //pushToLog(logStream,logMessage(threadNumber,simulationStartLogMessage(scenarioID)))

    const userBirthYear = baseScenario.birthYear[0]
    const currentTaxYearBrackets : Record<TaxBracketLevel,StateTaxBracket| FederalTax> = {"Federal": threadData.federalTaxes, "State": threadData.stateTaxes}
    let RMDTable : Record<number,number> = {}

    //pushToLog(logStream,logMessage(threadNumber,lifeExpectancyLogMessage(lifeExpectancy)))



    console.log("Starting")
    const startingYear = new Date().getFullYear();
    for(let simulation = 0; simulation < totalSimulations; simulation++){

        const scenario = structuredClone(baseScenario)
        const lifeExpectancy : number = calculateLifeExpectancy(scenario)
        const spouseLifeExpectancy : number = calculateSpousalLifeExpectancy(scenario)
        try{
            scenario.eventSeries = resolveEventDurations(scenario.eventSeries)
        }catch(error){
            console.log(error)
            throw new Error("Event time resolution error")
        }

        let simulatedYear = new Date().getFullYear();
        let previousYearIncome = 0
        let currentYearTotalIncome = 0
        let previousYearSocialSecurityIncome = 0

        for(let age = startingYear - userBirthYear; age < lifeExpectancy; age++){
            
            const inflationRate = calculateInflation(scenario)
            let spousalStatus : boolean;
            if(scenario.maritalStatus == "couple"){
                spousalStatus = determineSpousalStatus(scenario.birthYear[SPOUSE],spouseLifeExpectancy,simulatedYear)
            }else{
                spousalStatus = false
            }


            //TODO: Calculate brackets after inflation
            
            //TODO: Calculate annual limits on retirement account contributions after inflation

            //Income events
            const {totalEventIncome,totalSocialSecurityIncome, adjustedEvents} = 
            processIncome(scenario.eventSeries,inflationRate,spousalStatus,simulatedYear)

            scenario.investments["cash"].value += totalEventIncome
            currentYearTotalIncome += totalEventIncome
            scenario.eventSeries = adjustedEvents

            //Perform RMD
            if(age >= 74 && Object.values(scenario.investments).some((investment) => investment.taxStatus == "Pre-tax")){
                if(Object.keys(RMDTable).length === 0){
                    RMDTable = await RMDScraper()
                }
                const {RMDIncome, adjustedAccounts} = performRMD(scenario.investments, scenario.RMDStrategy,RMDTable,age)
                currentYearTotalIncome += RMDIncome
                scenario.investments = adjustedAccounts
            }  

            //Update the value of investments
            updateInvestments(scenario.investmentTypes,scenario.investments)
            simulatedYear += 1
            previousYearIncome = currentYearTotalIncome
            previousYearSocialSecurityIncome = totalSocialSecurityIncome
        }
        result['completed'] += 1
    }

    
    logStream.end()
    await finished(logStream)
    return result
}

/**
 * Description placeholder
 *
 * @param {Scenario} scenario 
 * @returns {number} 
 */
function calculateLifeExpectancy(scenario : Scenario){
    const userLifeExpectancy = scenario.lifeExpectancy[USER]
    if(userLifeExpectancy.type == "Fixed"){
        return userLifeExpectancy.value
    }else if(userLifeExpectancy.type == "Normal"){
        return Math.round(rnorm(1,userLifeExpectancy.mean,userLifeExpectancy.stdev)[0])
    }else{
        return rint(1,userLifeExpectancy.min,userLifeExpectancy.max, 1)[0]
    }
}

function calculateSpousalLifeExpectancy(scenario : Scenario){
    if(scenario.maritalStatus == "individual"){
        return 0
    }else{
        const spousalLifeExpectancy = scenario.lifeExpectancy[SPOUSE]
        if(spousalLifeExpectancy.type == "Fixed"){
            return spousalLifeExpectancy.value
        }else if(spousalLifeExpectancy.type == "Normal"){
            return Math.round(rnorm(1,spousalLifeExpectancy.mean,spousalLifeExpectancy.stdev)[0])
        }else{
            return rint(1,spousalLifeExpectancy.min,spousalLifeExpectancy.max, 1)[0]
        }
    }
}
/**
 * Description placeholder
 *
 * @param {Scenario} scenario 
 * @returns {number} 
 */
function calculateInflation(scenario : Scenario): number{
    const inflationAssumption = scenario.inflationAssumption
    if(inflationAssumption.type == "Fixed"){
        return inflationAssumption.value
    }else if(inflationAssumption.type == "Normal"){
        return rnorm(1,inflationAssumption.mean,inflationAssumption.stdev)[0]
    }else{
        return rint(1,inflationAssumption.min,inflationAssumption.max, 1)[0]
    }
}
function resolveInvestmentTypeDistribution(distribution : IncomeDistribution | ReturnDistribution): number{
    if(distribution.type == "Fixed"){
        return distribution.value
    }else if(distribution.type == "Normal"){
        return rnorm(1,distribution.mean,distribution.stdev)[0]
    }else{
        return rint(1,distribution.min,distribution.max, 1)[0]
    }
}
function calculateChangeDistribution(distribution : EventDistribution): number{
    if(distribution.type == "Fixed"){
        return distribution.value
    }else if(distribution.type == "Normal"){
        return rnorm(1,distribution.mean,distribution.stdev)[0]
    }else{
        return rint(1,distribution.min,distribution.max, 1)[0]
    }
}

function determineSpousalStatus(birthYear : number, spousalLifeExpectancy : number, currentYear : number){
    return (currentYear - birthYear) <= spousalLifeExpectancy
}

function resolveEventDurations(scenarioEvents : Record<string,ScenarioEvent>){
    const resolvedEventSeries : Record<string, ScenarioEvent> = {};
    const dependentEventStack : string[] = []

    for(const currentEventEntry of Object.entries(scenarioEvents)){
        
        const eventKey = currentEventEntry[EVENT_KEY]
        const currentEvent = structuredClone(currentEventEntry[EVENT_DATA])
        let realizedDuration : number;
        let realizedStart : number;
        
        
        //TP: Following code was generate by copilot with three promots
        /* generate all possible cases of currentEvent.duration as a switch statement without code inside */
        switch (currentEvent.duration.type) {
            case "Fixed":
                realizedDuration = currentEvent.duration.value
                break;
            case "Normal":
                realizedDuration = Math.round(rnorm(1, currentEvent.duration.mean, currentEvent.duration.stdev)[0])
                break;
            case "Uniform":
                realizedDuration = rint(1, currentEvent.duration.min, currentEvent.duration.max, 1)[0]
                break;
        }

        currentEvent.duration = {type: "Fixed", value: realizedDuration}

        if(currentEvent.start.type != "EventBased"){
            //TP: Following code was generate by copilot with three promots
            /* generate all possible cases of currentEvent.duration.start
            make it a switch statement
            remove the code inside the cases */
            switch (currentEvent.start.type) {
                case "Fixed":
                    realizedStart = currentEvent.start.value
                break;
                case "Normal":
                    realizedStart = Math.round(rnorm(1,currentEvent.start.mean,currentEvent.start.stdev)[0])
                break;
                case "Uniform":
                    realizedStart = rint(1,currentEvent.start.min,currentEvent.start.max, 1)[0]
                break;
            }
            currentEvent.start = {type: "Fixed", value: realizedStart}
        }else{
            dependentEventStack.push(eventKey)
        }
        resolvedEventSeries[eventKey] = currentEvent
    }

    while(dependentEventStack.length){
        const eventKey = dependentEventStack.pop()
        if(!eventKey){
            throw new Error("Dependent Event does not exist")
        }

        const event = resolvedEventSeries[eventKey]
        const parentEvent = resolvedEventSeries[eventKey]

        if(event.start.type != "EventBased"){
            throw new Error("Event already resolved")
        }

        
        if(event.start.withOrAfter == "With"){
            if(parentEvent.start.type != "Fixed"){
                dependentEventStack.push(eventKey)
            }else{ 
                event.start = {type: "Fixed", value: parentEvent.start.value}
            }
        }else if(event.start.withOrAfter == "After"){
            if(parentEvent.start.type != "Fixed"){
                dependentEventStack.push(eventKey)
            }else{
                if(parentEvent.duration.type != "Fixed"){
                    throw new Error("Parent duration hasn't been resolved")
                }
                event.start = {type: "Fixed", value: parentEvent.start.value + parentEvent.duration.value}
            }
        }else{
            throw new Error("Event already resolved?")
        }
        
    }

    for(const resolvedEvent of Object.values(scenarioEvents)){
        assert(resolvedEvent.start.type == "Fixed", "NOT ALL EVENTS RESOVLED")
    }

    return resolvedEventSeries
}

function hasEventStarted(currentEvent : ScenarioEvent, currentYear : number){
    const eventStartType = currentEvent.start.type
    if(eventStartType == "Fixed"){
        return currentYear >= currentEvent.start.value 
    }else{
        throw new Error("Event not resolved!")
    }
}
/**
 * Description placeholder
 *
 * @param {Record<string,ScenarioEvent>} scenarioEvents 
 * @param {number} inflationRate 
 * @returns {{ currentYearIncome: number; currentYearSocialSecurityIncome: number; adjustedIncomeEvents: Record<string, ScenarioEvent>; }} 
 */
function processIncome(scenarioEvents : Record<string,ScenarioEvent>, inflationRate : number, spousalStatus : boolean, currentYear : number){

    let totalEventIncome = 0
    let totalSocialSecurityIncome = 0
    const adjustedEvents : Record<string,ScenarioEvent> = {} 

    for(const currentEventEntry of Object.entries(scenarioEvents)){
        const currentEventKey = currentEventEntry[0]
        const currentEvent = currentEventEntry[1]

        if(currentEvent.event.type == "Income"){

            let eventIncome = 0
            let adjustedEventIncome = 0

            //Determine next year's income
            const incomeChange = calculateChangeDistribution(currentEvent.event.changeDistribution)
            if(currentEvent.event.changeAmountOrPercent == "Amount"){
                adjustedEventIncome = currentEvent.event.initialAmount + incomeChange
            }else if(currentEvent.event.changeAmountOrPercent == "Percent"){
                adjustedEventIncome += currentEvent.event.initialAmount * incomeChange
            }

            //Determine of the event has started
            if(hasEventStarted(currentEvent,currentYear)){
                const totalEventIncome = currentEvent.event.initialAmount

                if(spousalStatus == true){
                    eventIncome += totalEventIncome * currentEvent.event.userFraction
                }else{
                    eventIncome += totalEventIncome
                }
            }

            //Social Security count
            if(currentEvent.event.socialSecurity == true){
                totalSocialSecurityIncome += eventIncome
            }

            //Adjust for inflation
            if(currentEvent.event.inflationAdjusted == true){
                adjustedEventIncome += adjustedEventIncome * inflationRate
            }

            const modifiedEvent = structuredClone(currentEvent)
            if(modifiedEvent.event.type != "Income"){
                throw new Error("Event improperly cloned")
            }

            modifiedEvent.event.initialAmount = adjustedEventIncome
            adjustedEvents[currentEventKey] = modifiedEvent
            totalEventIncome += eventIncome
        }else{
            adjustedEvents[currentEventKey] = structuredClone(currentEvent)
        }
    }

    return {totalEventIncome,totalSocialSecurityIncome,adjustedEvents}
}

/**
 * Conducts a Required Minimum Distribution by transferring assets in-kind
 * from investments in pre-tax retirement accounts to investments in after-tax 
 * non-retirement accounts.
 */
function performRMD(investments : Record<string,Investment>, RMDStrategy : string[], RMDTable: Record<number,number>,age : number){

    let RMDIncome = 0
    if(RMDTable[age] == null){
        throw new Error(`No Required Distribution factor for age ${age}`)
    }
    const adjustedAccounts = structuredClone(investments)
    const preTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "Pre-tax")
    const nonPreTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus != "Pre-tax")

    let RMDIndex = 0


    const preTaxTotalValue = preTaxAccounts.reduce( (totalValue,investment) => totalValue += investment.value, 0)
    let requiredDistribution = preTaxTotalValue/RMDTable[age]

    if(requiredDistribution == null){
        throw new Error(`No Required Distribution for age ${age}`)
    }

    while(requiredDistribution > 0){
        const withdrawingAccount = adjustedAccounts[RMDStrategy[RMDIndex]]
        if(withdrawingAccount == null){
            throw new Error("Invalid investment in RMD strategy")
        }
        const withdrawingInvestmentType = withdrawingAccount.investmentType
        const withdrawalAmount = Math.min(withdrawingAccount.value,requiredDistribution)

        let receivingAccount : Investment | undefined = nonPreTaxAccounts.find((investment) => investment.investmentType == withdrawingInvestmentType && investment.taxStatus != "Pre-tax")

        if(receivingAccount == undefined){
            receivingAccount = {
                investmentType: withdrawingAccount.investmentType,
                value: 0,
                taxStatus: "After-tax",
                id: `${withdrawingAccount.investmentType}-after-tax`
            }

            adjustedAccounts[`${withdrawingAccount.investmentType}-after-tax`] = receivingAccount
        }

        withdrawingAccount.value -= withdrawalAmount
        
        if(withdrawingAccount.value == 0){
            RMDIndex++
        }
        receivingAccount.value += withdrawalAmount
        requiredDistribution--
    }
    RMDIncome += requiredDistribution

    return {RMDIncome,adjustedAccounts}


}

/** Updates the values of investments (noted internally as accounts) with data provided by
 *  the corresponding investmentType (noted interally as investmentData)
*/
function updateInvestments(investmentData : Record<string,InvestmentType>, accounts : Record<string,Investment>){
    let totalInvestmentIncome = 0
    const updatedAccounts : Record<string,Investment> = {}

    Object.values(accounts).forEach( (account) =>{
        const currentInvestmentData = investmentData[account.investmentType]
        const modifiedAccount = structuredClone(account)
        const startOfYearValue = modifiedAccount.value

        let investmentIncome = 0
        let investmentReturns = 0

        //Determine income
        if(currentInvestmentData.incomeAmtOrPct == "Amount"){
            investmentIncome = resolveInvestmentTypeDistribution(currentInvestmentData.incomeDistribution)
        }else if(currentInvestmentData.incomeAmtOrPct == "Percent"){
            investmentIncome = account.value * resolveInvestmentTypeDistribution(currentInvestmentData.incomeDistribution)
        }else{
            throw new Error("Invalid income change type")
        }

        totalInvestmentIncome += investmentIncome
        modifiedAccount.value += investmentIncome

        //Determine investment returns from dividends and interest
        if(currentInvestmentData.returnAmtOrPct == "Amount"){
            investmentReturns = resolveInvestmentTypeDistribution(currentInvestmentData.returnDistribution)
        }else if(currentInvestmentData.returnAmtOrPct == "Percent"){
            investmentReturns = account.value * resolveInvestmentTypeDistribution(currentInvestmentData.returnDistribution)
        }else{
            throw new Error("Invalid income change type")
        }

        modifiedAccount.value += investmentReturns

        //Determine expenses
        const averageValue = (startOfYearValue + modifiedAccount.value)/2.0
        const accountExpenses = averageValue * currentInvestmentData.expenseRatio
        modifiedAccount.value -= accountExpenses
        
        updatedAccounts[modifiedAccount.id] = modifiedAccount
    })

    return {totalInvestmentIncome, updatedAccounts}
    
}

/** Description placeholder */
function rothConversionOptimizer(){

}

/** Description placeholder */
function payNonDiscretionaryExpenses(){

}

/** Description placeholder */
function payDiscretionaryExpenses(){

}

/** Description placeholder */
function processInvestEvent(){

}
/** This is a description of the foo function. */
function processsRebalanceEvent(){

}
worker({
    simulation : simulation
})
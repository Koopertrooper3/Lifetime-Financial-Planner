/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createWriteStream, WriteStream } from "fs"
import path from "path"
import { finished } from "stream/promises"
import {scenarioModel, Scenario} from "../db/Scenario"
import PB from "probability-distributions"
import { Investment } from "../db/InvestmentSchema"
import { FederalTax, taxBracketType, StateTaxBracket, StateTax } from "../db/taxes"
import { worker } from 'workerpool'
import { Event as ScenarioEvent, assetProportion } from "../db/EventSchema"
import { assert } from "console"
import { EventDistribution } from "../db/EventSchema"
import { RMDScraper } from "../scraper/RMDScraper"
import { InvestmentType, IncomeDistribution, ReturnDistribution } from "../db/InvestmentTypesSchema"
import { initalizeCSVLog,writeCSVlog,closeCSVlog, incomeEventLogMessage, RMDLogMessage, expenseLogMessage, rothConversionLogMessage, investLogMessage } from "./logging"

const USER = 0
const SPOUSE = 1

const EVENT_KEY = 0
const EVENT_DATA = 1
const EARLY_WITHDRAWAL_PENALTY = 0.10
const EARLY_WITHDRAWAL_AGE = 59
const SOCIAL_SECURITY_PROPORTION = 0.85
//String generator functions
/**
 * Description placeholder
 *
 * @param {number} year 
 * @param {string} eventName 
 * @param {number} amount 
 * @returns {string} 
 */

function pushToLog(logStream : WriteStream, message : string){
    logStream.write(message)
}

type TaxType = "Federal Income" | "State Income" | "Capital Gains" | "Early Withdrawal Penalty"
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
    stateTaxes: StateTax
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
interface TaxBracketContainer {
    "Federal" : FederalTax,
    "State" : StateTax
}
/**
 * Description placeholder
 *
 * @async
 * @param {threadData} threadData 
 * @returns {unknown} 
 */

interface AnnualValues {
    totalIncome : number,
    totalSocialSecurityIncome: number,
    totalEarlyWithdrawal : number,
    totalCapitalGains : number,
}

async function simulation(threadData : threadData){
    const result : Result = {completed : 0, succeeded: 0, failed: 0}
    
 
    const startTime = new Date();
    const dateTimeString = `${startTime.getMonth()}_${startTime.getDay()}_${startTime.getFullYear()}_${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`
    const logStream = createWriteStream(path.resolve(__dirname, '..','..','logs',`${threadData.username}_${dateTimeString}.log`), {flags: 'a'})
    const csvStream : WriteStream = initalizeCSVLog(threadData.username,dateTimeString)

    const threadNumber : string = threadData.threadNumber.toString()
    const totalSimulations : number = threadData.simulationsPerThread
    const baseScenario : Scenario = threadData.scenario
    
    if(baseScenario == null){
        //Error log message to be added
        logStream.close()
        return result
    }


    const userBirthYear = baseScenario.birthYear[0]
    const baseTaxBrackets : TaxBracketContainer = {"Federal": threadData.federalTaxes, "State": threadData.stateTaxes}
    let RMDTable : Record<number,number> = {}

    console.log("Starting")
    const startingYear = new Date().getFullYear();
    for(let simulation = 0; simulation < totalSimulations; simulation++){

        const scenario = structuredClone(baseScenario)
        const lifeExpectancy : number = calculateLifeExpectancy(scenario)
        const spouseLifeExpectancy : number = calculateSpousalLifeExpectancy(scenario)
        const purchaseLedger : Record<string,number[]> = constructPurchaseLedger(scenario.investments)

        try{
            scenario.eventSeries = resolveEventDurations(scenario.eventSeries)
        }catch(error){
            console.log(error)
            throw new Error("Event time resolution error")
        }

        let simulatedYear = new Date().getFullYear();
        let prevYearValues : AnnualValues = {
            totalIncome: 0,
            totalSocialSecurityIncome: 0,
            totalCapitalGains: 0,
            totalEarlyWithdrawal: 0
        }

        let filingStatus = 0

        let currentYearTaxBrackets = baseTaxBrackets
        let previousYearTaxBrackets = baseTaxBrackets
        let solvent = true
        if(scenario.maritalStatus == "couple"){
            filingStatus = 2
        }

        for(let age = startingYear - userBirthYear; age < lifeExpectancy && solvent == true; age++){
            const currentYearValues : AnnualValues = {
                totalIncome: 0,
                totalSocialSecurityIncome: 0,
                totalCapitalGains: 0,
                totalEarlyWithdrawal: 0
            }

            const inflationRate = calculateInflation(scenario)
            let spousalStatus : boolean;
            if(scenario.maritalStatus == "couple"){
                spousalStatus = determineSpousalStatus(scenario.birthYear[SPOUSE],spouseLifeExpectancy,simulatedYear)
                if(spousalStatus == false && filingStatus > 0){
                    filingStatus--
                }
            }else{
                spousalStatus = false
            }


            //Calculate brackets after inflation
            currentYearTaxBrackets = adjustTaxBracketsForInflation(previousYearTaxBrackets,inflationRate)
            //TODO: Calculate annual limits on retirement account contributions after inflation
            const newAfterTaxContributionLimit = adjustRetirementAccountContributionLimit(scenario,inflationRate)
            scenario.afterTaxContributionLimit = newAfterTaxContributionLimit
            
            //Income events
            const {totalEventIncome,totalSocialSecurityIncome, adjustedEvents,incomeLogMessages} = 
            processIncome(scenario.eventSeries,inflationRate,spousalStatus,simulatedYear)

            scenario.investments["cash"].value += totalEventIncome
            currentYearValues.totalIncome += totalEventIncome
            scenario.eventSeries = adjustedEvents
            currentYearValues.totalSocialSecurityIncome += totalSocialSecurityIncome
            pushToLog(logStream,incomeLogMessages.join("\n"))

            //Perform RMD
            if(age >= 74 && Object.values(scenario.investments).some((investment) => investment.taxStatus == "Pre-tax")){
                if(Object.keys(RMDTable).length === 0){
                    RMDTable = await RMDScraper()
                }
                const {RMDIncome, adjustedAccounts,RMDLogMessages} = performRMD(scenario.investments, scenario.RMDStrategy,RMDTable,age,simulatedYear)
                currentYearValues.totalIncome += RMDIncome
                scenario.investments = adjustedAccounts
                pushToLog(logStream,RMDLogMessages.join("\n"))

            }  

            //Update the value of investments
            const {totalInvestmentIncome, updatedAccounts} = updateInvestments(scenario.investmentTypes,scenario.investments)
            scenario.investments = updatedAccounts
            currentYearValues.totalIncome += totalInvestmentIncome

            //Run roth conversion optimizer if conditions allow
            if(scenario.RothConversionOpt == true && simulatedYear >= scenario.RothConversionStart && simulatedYear <= scenario.RothConversionEnd){
                const {adjustedAccounts, rothConversionIncome,rothConversionLogMessages } = rothConversionOptimizer(scenario.RothConversionStrategy,scenario.investments,currentYearTaxBrackets["Federal"],
                    currentYearValues.totalIncome,filingStatus,simulatedYear)
                scenario.investments = adjustedAccounts
                currentYearValues.totalIncome += rothConversionIncome
                pushToLog(logStream,rothConversionLogMessages.join('\n'))
            }

            //Determine and pay taxes and non-discretionary expenses
            const nonDescExpenseReturn = payNonDiscretionaryExpenses(scenario,currentYearTaxBrackets,purchaseLedger,age,filingStatus,spousalStatus,
                prevYearValues,inflationRate,simulatedYear);

            scenario.eventSeries = nonDescExpenseReturn.adjustedEventSeries
            scenario.investments = nonDescExpenseReturn.adjustedAccounts
            currentYearValues.totalIncome += nonDescExpenseReturn.totalIncome
            currentYearValues.totalCapitalGains += nonDescExpenseReturn.totalCapitalGain
            currentYearValues.totalEarlyWithdrawal += nonDescExpenseReturn.earlyWithdrawal
            pushToLog(logStream,nonDescExpenseReturn.nonDescExpenseLogMessages.join('\n'))

            if(nonDescExpenseReturn.allExpensesPaid == false){
                solvent = false
                break;
            }
        
            const descExpenseReturn = payDiscretionaryExpenses(scenario,purchaseLedger,age,spousalStatus,inflationRate,simulatedYear)

            scenario.eventSeries = descExpenseReturn.adjustedEventSeries
            scenario.investments = descExpenseReturn.adjustedAccounts
            currentYearValues.totalIncome += descExpenseReturn.totalIncome
            currentYearValues.totalCapitalGains += descExpenseReturn.totalCapitalGain
            currentYearValues.totalEarlyWithdrawal += descExpenseReturn.earlyWithdrawal
            pushToLog(logStream,descExpenseReturn.discExpenseLogMessages.join('\n'))

            const investReturn = processInvestEvent(scenario,simulatedYear)
            scenario.investments = investReturn.adjustedAccounts
            pushToLog(logStream,investReturn.logMessages.join('\n'))

            //processRebalanceEvent()
            simulatedYear += 1
            prevYearValues = currentYearValues
            previousYearTaxBrackets = currentYearTaxBrackets

            writeCSVlog(scenario.investments,csvStream,simulatedYear)
        }

        if(solvent == true){
            result["succeeded"] += 1
        }else{
            result["failed"] += 1
        }
        result['completed'] += 1
    }

    
    logStream.end()
    await finished(logStream)
    await closeCSVlog(csvStream)
    return result
}


function constructPurchaseLedger(accounts: Record<string,Investment>){
    const newPurchaseLedger : Record<string,number[]> = {}
    Object.values(accounts).forEach((account) =>{
        newPurchaseLedger[account.id] = [account.value]
    })
    return newPurchaseLedger
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
        return Math.round(PB.rnorm(1,userLifeExpectancy.mean,userLifeExpectancy.stdev)[0])
    }else{
        return PB.rint(1,userLifeExpectancy.min,userLifeExpectancy.max, 1)[0]
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
            return Math.round(PB.rnorm(1,spousalLifeExpectancy.mean,spousalLifeExpectancy.stdev)[0])
        }else{
            return PB.rint(1,spousalLifeExpectancy.min,spousalLifeExpectancy.max, 1)[0]
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
        return PB.rnorm(1,inflationAssumption.mean,inflationAssumption.stdev)[0]
    }else{
        return PB.rint(1,inflationAssumption.min,inflationAssumption.max, 1)[0]
    }
}
function resolveInvestmentTypeDistribution(distribution : IncomeDistribution | ReturnDistribution): number{
    if(distribution.type == "Fixed"){
        return distribution.value
    }else if(distribution.type == "Normal"){
        return PB.rnorm(1,distribution.mean,distribution.stdev)[0]
    }else{
        return PB.rint(1,distribution.min,distribution.max, 1)[0]
    }
}
function calculateChangeDistribution(distribution : EventDistribution): number{
    if(distribution.type == "Fixed"){
        return distribution.value
    }else if(distribution.type == "Normal"){
        return PB.rnorm(1,distribution.mean,distribution.stdev)[0]
    }else{
        return PB.rint(1,distribution.min,distribution.max, 1)[0]
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
                realizedDuration = Math.round(PB.rnorm(1, currentEvent.duration.mean, currentEvent.duration.stdev)[0])
                break;
            case "Uniform":
                realizedDuration = PB.rint(1, currentEvent.duration.min, currentEvent.duration.max, 1)[0]
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
                    realizedStart = Math.round(PB.rnorm(1,currentEvent.start.mean,currentEvent.start.stdev)[0])
                break;
                case "Uniform":
                    realizedStart = PB.rint(1,currentEvent.start.min,currentEvent.start.max, 1)[0]
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

        if(event.start.type != "EventBased"){
            throw new Error("Event already resolved")
        }

        const parentEvent = resolvedEventSeries[event.start.event]

        
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

    for(const resolvedEvent of Object.values(resolvedEventSeries)){
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

function adjustTaxBracketsForInflation(taxBrackets: TaxBracketContainer, inflationRate: number){

    const adjustedTaxBrackets = structuredClone(taxBrackets)

    //Update federal brackets
    const federalBrackets = adjustedTaxBrackets.Federal
    federalBrackets.singleIncomeTaxBrackets.forEach((taxBracket) => {
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
    })

    federalBrackets.marriedIncomeTaxBrackets.forEach((taxBracket) => {
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
    })

    federalBrackets.singleCapitalGainsTaxBrackets.forEach((taxBracket) => {
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
    })

    federalBrackets.marriedIncomeTaxBrackets.forEach((taxBracket) => {
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
    })

    federalBrackets.singleStandardDeduction += adjustedTaxBrackets.Federal.singleStandardDeduction*inflationRate

    federalBrackets.marriedStandardDeduction += adjustedTaxBrackets.Federal.marriedStandardDeduction*inflationRate

    //Update state brackets
    const stateBrackets = adjustedTaxBrackets.State

    stateBrackets.singleIncomeTax.forEach((taxBracket) =>{
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
        taxBracket.flatAdjustment += taxBracket.flatAdjustment*inflationRate
    })

    stateBrackets.marriedIncomeTax.forEach((taxBracket) =>{
        taxBracket.upperThreshold += taxBracket.upperThreshold*inflationRate
        taxBracket.flatAdjustment += taxBracket.flatAdjustment*inflationRate
    })

    return adjustedTaxBrackets
}
/**
 * Description placeholder
 *
 * @param {Record<string,ScenarioEvent>} scenarioEvents 
 * @param {number} inflationRate 
 * @returns {{ currentYearIncome: number; currentYearSocialSecurityIncome: number; adjustedIncomeEvents: Record<string, ScenarioEvent>; }} 
 */

function adjustRetirementAccountContributionLimit(scenario : Scenario, inflationRate : number){
    const currentLimit = scenario.afterTaxContributionLimit
    return currentLimit + (currentLimit * inflationRate)
}
function processIncome(scenarioEvents : Record<string,ScenarioEvent>, inflationRate : number, 
    spousalStatus : boolean, currentYear : number){

    let totalEventIncome = 0.0
    let totalSocialSecurityIncome = 0.0
    const adjustedEvents : Record<string,ScenarioEvent> = {} 
    const incomeLogMessages : string[] = []

    for(const currentEventEntry of Object.entries(scenarioEvents)){
        const currentEventKey = currentEventEntry[0]
        const currentEvent = currentEventEntry[1]

        if(currentEvent.event.type == "Income"){

            let eventIncome = 0.0
            let adjustedEventIncome
            const modifiedEvent = structuredClone(currentEvent)

            //Determine next year's income
            const incomeChange = calculateChangeDistribution(currentEvent.event.changeDistribution)
            if(currentEvent.event.changeAmountOrPercent == "Amount"){
                adjustedEventIncome = currentEvent.event.initialAmount + incomeChange
            }else if(currentEvent.event.changeAmountOrPercent == "Percent"){
                adjustedEventIncome = currentEvent.event.initialAmount + (currentEvent.event.initialAmount * incomeChange)
            }else{
                throw new Error("Invalid change distribution")
            }

            //Determine of the event has started
            if(hasEventStarted(currentEvent,currentYear)){
                const totalEventIncome = currentEvent.event.initialAmount

                if(spousalStatus == true){
                    eventIncome += totalEventIncome
                }else{
                    eventIncome += totalEventIncome * currentEvent.event.userFraction
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

            if(modifiedEvent.event.type != "Income"){
                throw new Error("Event improperly cloned")
            }

            modifiedEvent.event.initialAmount = adjustedEventIncome
            adjustedEvents[currentEventKey] = modifiedEvent

            totalEventIncome += eventIncome

            incomeLogMessages.push(incomeEventLogMessage(currentYear,modifiedEvent.name,eventIncome))
        }else{
            adjustedEvents[currentEventKey] = structuredClone(currentEvent)
        }
    }

    return {totalEventIncome,totalSocialSecurityIncome,adjustedEvents,incomeLogMessages}
}

/** 
 * Conducts a Required Minimum Distribution by transferring assets in-kind
 * from investments in pre-tax retirement accounts to investments in non-retirement
 * accounts.
 */
function performRMD(investments : Record<string,Investment>, RMDStrategy : string[], RMDTable: Record<number,number>,age : number,year : number){

    let RMDIncome = 0
    if(RMDTable[age] == null){
        throw new Error(`No Required Distribution factor for age ${age}`)
    }
    const adjustedAccounts = structuredClone(investments)
    const preTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "Pre-tax")
    const nonRetirementTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "Non-retirement")
    const RMDLogMessages : string[] = []
    let RMDIndex = 0

    const preTaxTotalValue = preTaxAccounts.reduce( (totalValue,investment) => totalValue += investment.value, 0.0)
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
        const withdrawnAmount = Math.min(withdrawingAccount.value,requiredDistribution)

        let receivingAccount : Investment | undefined = nonRetirementTaxAccounts.find((investment) => investment.investmentType == withdrawingInvestmentType && investment.taxStatus == "Non-retirement")

        if(receivingAccount == undefined){
            receivingAccount = {
                investmentType: withdrawingAccount.investmentType,
                value: 0,
                taxStatus: "Non-retirement",
                id: `${withdrawingAccount.investmentType}-non-retirement`
            }

            adjustedAccounts[`${withdrawingAccount.investmentType}-non-retirement`] = receivingAccount
        }

        withdrawingAccount.value -= withdrawnAmount
        
        if(withdrawingAccount.value == 0){
            RMDIndex++
        }

        receivingAccount.value += withdrawnAmount
        requiredDistribution-= withdrawnAmount
        RMDLogMessages.push(RMDLogMessage(year, withdrawnAmount, withdrawingAccount.investmentType))

    }

    RMDIncome += requiredDistribution

    return {RMDIncome,adjustedAccounts,RMDLogMessages}


}

/** 
 * Updates the values of investments (noted internally as accounts) with data provided by
 *  the corresponding investmentType (noted interally as investmentData)
*/
function updateInvestments(investmentDataRecord : Record<string,InvestmentType>, accounts : Record<string,Investment>){
    let totalInvestmentIncome = 0.0
    const updatedAccounts : Record<string,Investment> = {}

    Object.values(accounts).forEach( (account) =>{
        const currentInvestmentData = investmentDataRecord[account.investmentType]
        const modifiedAccount = structuredClone(account)
        const startOfYearValue = modifiedAccount.value

        let investmentIncome = 0.0
        let investmentValueChange = 0.0

        //Determine investment returns from dividends and interest
        if(currentInvestmentData.returnAmtOrPct == "Amount"){
            investmentValueChange = resolveInvestmentTypeDistribution(currentInvestmentData.returnDistribution)
        }else if(currentInvestmentData.returnAmtOrPct == "Percent"){
            investmentValueChange = account.value * resolveInvestmentTypeDistribution(currentInvestmentData.returnDistribution)
        }else{
            throw new Error("Invalid value change type")
        }

        //Determine income
        if(currentInvestmentData.incomeAmtOrPct == "Amount"){
            investmentIncome = resolveInvestmentTypeDistribution(currentInvestmentData.incomeDistribution)
        }else if(currentInvestmentData.incomeAmtOrPct == "Percent"){
            investmentIncome = account.value * resolveInvestmentTypeDistribution(currentInvestmentData.incomeDistribution)
        }else{
            throw new Error("Invalid income change type")
        }

        if(account.taxStatus == "Non-retirement" && currentInvestmentData.taxability == true){
            totalInvestmentIncome += investmentIncome
        }
        modifiedAccount.value += investmentIncome


        modifiedAccount.value += investmentValueChange

        //Determine expenses
        const averageValue = (startOfYearValue + modifiedAccount.value)/2.0
        const accountExpenses = averageValue * currentInvestmentData.expenseRatio
        modifiedAccount.value -= accountExpenses
        
        updatedAccounts[modifiedAccount.id] = modifiedAccount
    })

    return {totalInvestmentIncome, updatedAccounts}
    
}

/** 
 * Conducts an in-kind transfer of assets from pre-tax retirement accounts 
 * to after-tax retirement accounts to minimize lifetime income tax.
*/
function rothConversionOptimizer(rothConversionStrategy : string[], accounts : Record<string,Investment>,federalTaxBracket : FederalTax, 
    currentYearIncome : number, filingStatus: number, year : number){
    
    const rothConversionLogMessages : string[] = []
    let incomeTaxBracket : taxBracketType[];
    const adjustedAccounts : Record<string,Investment> = structuredClone(accounts)

    if(filingStatus > 0){
        incomeTaxBracket = federalTaxBracket.marriedIncomeTaxBrackets
    }else{
        incomeTaxBracket = federalTaxBracket.singleIncomeTaxBrackets
    }

    const currentBracket = incomeTaxBracket.find((bracket,index,taxBrackets) => {
        if(index+1 > taxBrackets.length){
            return true
        }else{
            return taxBrackets[index+1].upperThreshold >= currentYearIncome
        }
    });

    if(currentBracket == undefined){
        throw new Error(`Tax bracket does not exist for income ${currentYearIncome}`)
    }
    const upperThreshold = currentBracket.upperThreshold
    let rothConversionAmount = upperThreshold - currentYearIncome
    const rothConversionIncome = rothConversionAmount
    let rothStrategyIndex = 0

    while(rothConversionAmount > 0 && rothStrategyIndex < rothConversionStrategy.length){
        const withdrawingAccount = adjustedAccounts[rothConversionStrategy[rothStrategyIndex]]
        if(withdrawingAccount == null){
            throw new Error("Invalid investment in roth conversion strategy")
        }
        if(withdrawingAccount.taxStatus != "Pre-tax"){
            throw new Error("Invalid investment tax status for roth conversion")
        }
        const withdrawingInvestmentType = withdrawingAccount.investmentType
        const withdrawnAmount = Math.min(withdrawingAccount.value, rothConversionAmount)

        let receivingAccount : Investment | undefined = Object.values(accounts).find((investment) => investment.investmentType == withdrawingInvestmentType && investment.taxStatus == "After-tax")

        if(receivingAccount == undefined){
            receivingAccount = {
                investmentType: withdrawingAccount.investmentType,
                value: 0,
                taxStatus: "After-tax",
                id: `${withdrawingAccount.investmentType}-after-tax`
            }

            adjustedAccounts[`${withdrawingAccount.investmentType}-after-tax`] = receivingAccount
        }

        withdrawingAccount.value -= withdrawnAmount
        
        if(withdrawingAccount.value == 0){
            rothStrategyIndex++
        }

        receivingAccount.value += withdrawnAmount
        rothConversionAmount--
        
        rothConversionLogMessages.push(rothConversionLogMessage(year,withdrawnAmount,withdrawingInvestmentType))

    }

    return {adjustedAccounts, rothConversionIncome,rothConversionLogMessages}

}

function calculateFederalIncomeTax(taxBrackets : FederalTax, income : number,socialSecurity : number,filingStatus : number){

    //TP: Generated by Github Copilot with the prompt
    //"create an algorithm that calculates how much I have to pay in US federal taxes given my annual income"
    income += socialSecurity*SOCIAL_SECURITY_PROPORTION
    let taxBurden = 0.0;
    let incomeTaxBracket : taxBracketType[];
    let standardDeduction : number
    // Determine the applicable tax brackets based on filing status
    if(filingStatus > 0){
        incomeTaxBracket = taxBrackets.marriedIncomeTaxBrackets
        standardDeduction = taxBrackets.marriedStandardDeduction
    }else{
        incomeTaxBracket = taxBrackets.singleIncomeTaxBrackets
        standardDeduction = taxBrackets.singleStandardDeduction

    }

    income -= standardDeduction;
    let previousBracket = 0
    // Iterate through the tax brackets to calculate the tax burden
    for (const bracket of incomeTaxBracket) {
        const taxableIncome = Math.min(income, bracket.upperThreshold)-previousBracket;
        taxBurden += taxableIncome * bracket.rate;
        previousBracket = bracket.upperThreshold
    }

    if(taxBurden < 0){
        taxBurden = 0
    }
    return taxBurden;
}

function calculateFederalCapitalGainsTax(taxBrackets : FederalTax, income : number, capitalGains : number,filingStatus : number){
    if(capitalGains <= 0){
        return 0.0
    }
    
    let capitalGainsTaxBracket;
    

    if(filingStatus > 0){
        capitalGainsTaxBracket = taxBrackets.marriedcapitalGainsTaxBrackets
    }else{
        capitalGainsTaxBracket = taxBrackets.singleCapitalGainsTaxBrackets
    }

    const capitalGainsRate = capitalGainsTaxBracket.find((bracket,index,taxBrackets) => {
        if(index+1 > taxBrackets.length){
            return true
        }else{
            return taxBrackets[index+1].upperThreshold >= income
        }
    })?.rate
    
    if(capitalGainsRate == undefined){
        throw new Error("Unable to find capital gains tax rate")
    }

    return capitalGains*capitalGainsRate
}

function calculateWithdrawalTax(previousYearEarlyWithdrawals : number){
    return previousYearEarlyWithdrawals*EARLY_WITHDRAWAL_PENALTY
}

function calculateStateIncomeTax(taxBrackets : StateTax, income : number,filingStatus : number){

    //TP: Generated by Github Copilot with the prompt
    //"create an algorithm that calculates how much I have to pay in US federal taxes given my annual income"

    let taxBurden = 0.0;
    let incomeTaxBracket : StateTaxBracket[];

    // Determine the applicable tax brackets based on filing status
    if(filingStatus > 0){
        incomeTaxBracket = taxBrackets.marriedIncomeTax
    }else{
        incomeTaxBracket = taxBrackets.singleIncomeTax
    }
    
    // Iterate through the tax brackets to calculate the tax burden
    for (const bracket of incomeTaxBracket) {
        const taxableIncome = Math.min(income, bracket.upperThreshold);
        taxBurden += taxableIncome * bracket.rate + bracket.flatAdjustment;

        if (income <= bracket.upperThreshold) {
            break;
        }
        
    }

    return taxBurden;
}

/** Description placeholder */
function determineTaxBurden(taxBrackets: TaxBracketContainer, prevYearValues: AnnualValues, filingStatus : number, year : number){
    
    const newExpenseSeries : ExpenseObject[] = []
    const federalIncomeTaxBurden = calculateFederalIncomeTax(taxBrackets.Federal,prevYearValues.totalIncome,prevYearValues.totalSocialSecurityIncome,filingStatus)
    const federalCapitalGainsTaxBurden = calculateFederalCapitalGainsTax(taxBrackets.Federal,prevYearValues.totalIncome,prevYearValues.totalCapitalGains,filingStatus)
    const earlyWithdrawalTax = calculateWithdrawalTax(prevYearValues.totalEarlyWithdrawal)
    const stateTaxBurden = calculateStateIncomeTax(taxBrackets.State,prevYearValues.totalIncome,filingStatus)
    
    newExpenseSeries.push(
        {
            expenseAmount : federalIncomeTaxBurden,
            logMessage : expenseLogMessage(year,federalIncomeTaxBurden,"Federal Income Tax"),
        },{
            expenseAmount : stateTaxBurden,
            logMessage : expenseLogMessage(year,stateTaxBurden,"State Income Tax"),
        },{
            expenseAmount : federalCapitalGainsTaxBurden,
            logMessage : expenseLogMessage(year,federalCapitalGainsTaxBurden,"Federal Capital Gains Tax"),
        },{
            expenseAmount : earlyWithdrawalTax,
            logMessage : expenseLogMessage(year,earlyWithdrawalTax,"Early Withdrawal Income"),
        },)
    

    const totalExpenses = federalIncomeTaxBurden + federalCapitalGainsTaxBurden + stateTaxBurden + earlyWithdrawalTax
    return newExpenseSeries
}

function determineTaxableCapitalGain(purchaseLedger : number[], withdrawalAmount : number, investmentValue : number){
    const purchasePrice = purchaseLedger.reduce((total,price)=>{
        return total += price
    },0.0)
    
    let capitalGain = 0.0

    if(withdrawalAmount == investmentValue){
        capitalGain = investmentValue - purchasePrice
    }else{
        const fraction = withdrawalAmount/investmentValue
        capitalGain = fraction * (investmentValue - purchasePrice)
    }

    if(capitalGain < 0.0){
        capitalGain = 0.0
    }

    return capitalGain
}

function generateExpenseSeriesFromEvents(eventSeries : Record<string,ScenarioEvent>,year : number,inflationRate : number,spousalStatus : boolean){

    const adjustedEventSeries = structuredClone(eventSeries)

    const eventExpenses = Object.values(eventSeries).filter((currEvent) => currEvent.event.type == "Expense" && hasEventStarted(currEvent,year)).map((currEvent) =>{
        if(currEvent.event.type != "Expense" || !hasEventStarted(currEvent,year)){
            throw new Error("Filter doesn't work properly")
        }

        let totalExpense : number
        if(spousalStatus == true){
            totalExpense = currEvent.event.initialAmount
        }else{
            totalExpense = currEvent.event.initialAmount * currEvent.event.userFraction
        }

        const newExpenseObject : ExpenseObject = {
            expenseAmount : currEvent.event.initialAmount,
            logMessage : expenseLogMessage(year,currEvent.event.initialAmount,currEvent.name),
        }

        //Adjust expenses
        const adjustedEvent = adjustedEventSeries[currEvent.name]
        if(adjustedEvent.event.type != "Expense"){
            throw new Error("Clone failed to properly copy event")
        }
        adjustedEvent.event.initialAmount = determineExpenseValueChange(currEvent,inflationRate)

        return newExpenseObject

    })

    return {eventExpenses,adjustedEventSeries}
}
interface ExpenseObject {
    expenseAmount : number
    logMessage : string
}
interface payNonDescExpensesReturn{
    allExpensesPaid: boolean,
    adjustedEventSeries : Record<string,ScenarioEvent>,
    adjustedAccounts : Record<string,Investment>,
    totalIncome : number,
    totalCapitalGain : number,
    earlyWithdrawal : number,
    nonDescExpenseLogMessages : string[]
}
function payNonDiscretionaryExpenses(scenario : Scenario, taxBracket : TaxBracketContainer, purchaseLedger : Record<string, number[]>, age : number, 
    filingStatus : number, spousalStatus : boolean, prevYearValues : AnnualValues, inflationRate : number, year : number) : payNonDescExpensesReturn{
    

    const accounts = scenario.investments
    const adjustedAccounts = structuredClone(accounts)
    const expenseWithdrawalStrategy = scenario.expenseWithdrawalStrategy
    const eventSeries = scenario.eventSeries
    const investmentDataRecord = scenario.investmentTypes
    const expenseSeries :  ExpenseObject[] = []
    const nonDescExpenseLogMessages : string[] = []

    let allExpensesPaid = false

    expenseSeries.concat(determineTaxBurden(taxBracket,prevYearValues,filingStatus,filingStatus))

    let earlyWithdrawal = 0.0
    let totalIncome = 0.0
    let totalCapitalGain = 0.0
    let expenseWithdrawalStrategyIndex = 0

    const eventExpensesResult = generateExpenseSeriesFromEvents(eventSeries,year,inflationRate,spousalStatus)

    expenseSeries.concat(eventExpensesResult.eventExpenses)
    const adjustedEventSeries = eventExpensesResult.adjustedEventSeries

    const cashInvestment = adjustedAccounts["cash"]
    if(cashInvestment == null){
        throw new Error("Cash does not exist")
    }
    
        
    for(const currentExpense of expenseSeries){

        //Determine total cost of expenses with respect to spousal status
        let totalExpenses : number = currentExpense.expenseAmount

        //Withdraw from cash first
        const cashWithdrawal = Math.min(cashInvestment.value,totalExpenses)
        totalExpenses -= cashWithdrawal
        cashInvestment.value -= cashWithdrawal

        while(totalExpenses >= 0 && expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){

            const withdrawingAccount = adjustedAccounts[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]];
            const currentInvestmentData = investmentDataRecord[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]]
            const currentInvestmentLedger = purchaseLedger[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]]

            if(withdrawingAccount == null || currentInvestmentData == null || currentInvestmentLedger == null){
                throw new Error("Investment does not exist")
            }

            const withdrawnAmount = Math.min(totalExpenses,withdrawingAccount.value);

            const taxFromWithdrawal = determineTaxFromWithdrawal(withdrawingAccount,currentInvestmentData,currentInvestmentLedger,withdrawnAmount,age)

            totalIncome += taxFromWithdrawal.income
            totalCapitalGain += taxFromWithdrawal.capitalGain
            earlyWithdrawal += taxFromWithdrawal.earlyWithdrawal

            totalExpenses -= withdrawnAmount
            withdrawingAccount.value -= withdrawnAmount

            if(withdrawingAccount.value == 0){
                expenseWithdrawalStrategyIndex++
            }

            

        }
        if(expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){
            nonDescExpenseLogMessages.push(currentExpense.logMessage)
        }else{
            return {allExpensesPaid,totalIncome,totalCapitalGain,earlyWithdrawal,adjustedEventSeries,adjustedAccounts,nonDescExpenseLogMessages}
        }
        
    }

    allExpensesPaid = true
    return {allExpensesPaid,totalIncome,totalCapitalGain,earlyWithdrawal,adjustedEventSeries,adjustedAccounts,nonDescExpenseLogMessages}
    
}
function determineExpenseValueChange(event : ScenarioEvent,inflationRate : number){
    //Determine next year's expense
    if(event.event.type != "Expense"){
        throw new Error("Not an expense, function not applicable")
    }

    let adjustedEventExpense
    const incomeChange = calculateChangeDistribution(event.event.changeDistribution)
    if(event.event.changeAmountOrPercent == "Amount"){
        adjustedEventExpense = event.event.initialAmount + incomeChange
    }else if(event.event.changeAmountOrPercent == "Percent"){
        adjustedEventExpense = event.event.initialAmount + (event.event.initialAmount * incomeChange)
    }else{
        throw new Error("Invalid expense event change distribution")
    }

    if(event.event.inflationAdjusted == true){
        adjustedEventExpense += adjustedEventExpense * inflationRate
    }

    return adjustedEventExpense
}
function determineTaxFromWithdrawal(account : Investment, investmentData : InvestmentType, currentPurchaseLedger : number[], withdrawnAmount : number,
    age : number){
    
    let earlyWithdrawal = 0.0
    let capitalGain = 0.0
    let income = 0.0
    
    //Consider tax implications
    if(account.taxStatus == "After-tax"){
        //Tax-free accounts
        //Subject to early withdrawal penalties
        //Subject to capital gains

        if(age < EARLY_WITHDRAWAL_AGE){
            earlyWithdrawal += withdrawnAmount
        }
        capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,account.value)

    }else if(account.taxStatus == "Pre-tax"){
        //Tax-deferred accounts
        //Subject to early withdrawal penalties
        //Subject to income tax

        if(age < EARLY_WITHDRAWAL_AGE){
            earlyWithdrawal += withdrawnAmount
        }

        income += withdrawnAmount

    }else if(account.taxStatus == "Non-retirement"){
        //Taxable accounts
        //Subject to capital gains

        if(investmentData == null){
            throw new Error("Invalid investment type")
        }
        capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,account.value)
        
    }else{
        throw new Error("Invalid tax status")
    }

    return {income,earlyWithdrawal,capitalGain}

}

interface payDiscExpensesReturn {
    adjustedAccounts : Record<string,Investment>,
    adjustedEventSeries : Record<string,ScenarioEvent>,
    totalIncome : number,
    earlyWithdrawal : number,
    totalCapitalGain : number,
    discExpenseLogMessages : string[]
}
/** Description placeholder */
function payDiscretionaryExpenses(scenario : Scenario, purchaseLedger : Record<string,number[]>, age : number,spousalStatus : boolean,inflationRate : number,year : number) : payDiscExpensesReturn{

    const accounts = scenario.investments
    const adjustedAccounts = structuredClone(scenario.investments)
    const finanicalGoal = scenario.financialGoal
    const expenseWithdrawalStrategy = scenario.expenseWithdrawalStrategy
    const spendingStrategy = scenario.spendingStrategy
    const eventSeries = scenario.eventSeries
    const adjustedEventSeries = structuredClone(scenario.eventSeries)
    const investmentDataRecord = scenario.investmentTypes
    const cashInvestment = adjustedAccounts["cash"]
    const discExpenseLogMessages : string[] = []
    if(cashInvestment == null){
        throw new Error("Cash does not exist")
    }

    const totalValue = Object.values(accounts).reduce((accumulatedValue, account)=>{
        return accumulatedValue += account.value
    },0.0)

    let expendableValue = totalValue-finanicalGoal
    let earlyWithdrawal = 0.0
    let totalIncome = 0.0
    let totalCapitalGain = 0.0
    let expenseWithdrawalStrategyIndex = 0

   while(expendableValue >= 0 && expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){
        
        for(const expenseID in spendingStrategy){

            //Determine if we have exhausted all our accounts that we can withdraw from
            if(expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){
                break
            }

            //Determine expenses first
            const currentExpense = adjustedEventSeries[expenseID];
            if(currentExpense.event.type != "Expense"){
                throw new Error("Non-expense in spending strategy")
            }
            if(hasEventStarted(currentExpense,year) == false){
                continue
            }

            let totalExpenses = 0
            if(spousalStatus == true){
                totalExpenses = currentExpense.event.initialAmount
            }else{
                totalExpenses = currentExpense.event.initialAmount * currentExpense.event.userFraction
            }

            if(expendableValue-totalExpenses <= 0){
                continue;
            }

            //Withdraw from cash first
            const cashWithdrawal = Math.min(totalExpenses,cashInvestment.value)
            totalExpenses -= cashWithdrawal
            cashInvestment.value -= cashWithdrawal

            while(totalExpenses >= 0 && expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){

                const withdrawingAccount = adjustedAccounts[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]];
                const currentInvestmentData = investmentDataRecord[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]]
                const currentInvestmentLedger = purchaseLedger[expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]]
                if(withdrawingAccount == null || currentInvestmentData == null || currentInvestmentLedger == null){
                    throw new Error("Investment does not exist")
                }

                const withdrawnAmount = Math.min(totalExpenses,withdrawingAccount.value);

                const taxFromWithdrawal = determineTaxFromWithdrawal(withdrawingAccount,currentInvestmentData,currentInvestmentLedger,withdrawnAmount,age)

                totalIncome += taxFromWithdrawal.income
                totalCapitalGain += taxFromWithdrawal.capitalGain
                earlyWithdrawal += taxFromWithdrawal.earlyWithdrawal

                totalExpenses -= withdrawnAmount
                withdrawingAccount.value -= withdrawnAmount
                expendableValue -= withdrawnAmount
                currentExpense.event.initialAmount = determineExpenseValueChange(currentExpense,inflationRate)
                if(withdrawingAccount.value == 0){
                    expenseWithdrawalStrategyIndex++
                }

            }

        }

   }

    return {earlyWithdrawal,totalIncome,totalCapitalGain,adjustedAccounts,adjustedEventSeries,discExpenseLogMessages}

}

function determineInvestmentAllocation(investEvent : ScenarioEvent,currentYear : number){
    if(investEvent.event.type != "Invest"){
        throw new Error("Invalid Invest Event")
    }

    if(investEvent.start.type != "Fixed" || investEvent.duration.type != "Fixed"){
        throw new Error("Event not resolved")
    }

    let currentYearAllocations : Record<string,number>

    if(investEvent.event.glidePath == true){
        const yearsIntoEvent = (investEvent.start.value+investEvent.duration.value) - currentYear
        const startingAllocations = investEvent.event.assetAllocation
        const endingAllocations = investEvent.event.assetAllocation2
        currentYearAllocations = {}
        const duration = investEvent.duration.value
        

        Object.entries(startingAllocations).forEach(([assetType,initalProportion]) =>{
            const finalProportion = endingAllocations[assetType]
            if(finalProportion == null){
                throw new Error("No corresponding proportion")
            }

            const rate = (finalProportion-initalProportion)/duration
            currentYearAllocations[assetType] = rate*yearsIntoEvent+initalProportion
            
        })
        
        
    }else{
        currentYearAllocations = investEvent.event.assetAllocation
    }

    return currentYearAllocations
}

/** Non-retirement or after tax */
function processInvestEvent(scenario: Scenario,year : number){
    const logMessages : string[] = []
    const afterTaxContributionLimit = scenario.afterTaxContributionLimit
    const investEvent = Object.values(scenario.eventSeries).find((event) => event.event.type == "Invest")
    const cash = scenario.investments["cash"]
    const investmentData = scenario.investmentTypes
    const adjustedAccounts = structuredClone(scenario.investments)

    if(investEvent == null || hasEventStarted(investEvent,year) == false){
        return {adjustedAccounts,logMessages}
    }

    if(investEvent.event.type != "Invest"){
        throw new Error("Invalid Invest Event")
    }
    if(cash == null){
        throw new Error("No cash investment")
    }
    const currYearInvestmentAllocation = determineInvestmentAllocation(investEvent,year)

    const excessCash = cash.value - investEvent.event.maxCash

    if(excessCash < 0){
        return {adjustedAccounts,logMessages}
    }else{
        //Determine how the excess cash is distributed


        // const totalInvestmentValue = Object.keys(scenario.investments).reduce((accumulatedValue, currentInvestment)=>{
        //     return accumulatedValue += adjustedAccounts[currentInvestment].value
        // },0.0)

        const realizedInvestmentAllocations = Object.values(currYearInvestmentAllocation).map((proportion)=>{
            return (excessCash*proportion)
        })

        const totalAfterTaxContribution = Object.entries(realizedInvestmentAllocations).reduce((totalValue,[asset,contribution]) =>{
            if(adjustedAccounts[asset].taxStatus == "After-tax"){
                totalValue += contribution
            }
            return totalValue
        },0.0)

        if(totalAfterTaxContribution > afterTaxContributionLimit){
            const reductionProportion = afterTaxContributionLimit/totalAfterTaxContribution
            Object.entries(realizedInvestmentAllocations).map(([asset,contribution]) =>{
                if(adjustedAccounts[asset].taxStatus == "After-tax"){
                    contribution -= contribution*reductionProportion
                }else{
                    contribution += contribution*reductionProportion
                }
            })
        }

        //Make the necessary investments
        Object.entries(realizedInvestmentAllocations).map(([asset,contribution]) =>{
            adjustedAccounts[asset].value += contribution
            logMessages.push(investLogMessage(year,contribution,asset))
        })


    }

    return {adjustedAccounts,logMessages}
}

function determineRebalanceAllocation(rebalanceEvent : ScenarioEvent, currentYear : number){
    if(rebalanceEvent.event.type != "Rebalance"){
        throw new Error("Invalid Rebalance Event")
    }

    if(rebalanceEvent.start.type != "Fixed" || rebalanceEvent.duration.type != "Fixed"){
        throw new Error("Event not resolved")
    }

    let currentYearAllocations : Record<string,number>

    if(rebalanceEvent.event.glidePath == true){
        const yearsIntoEvent = (rebalanceEvent.start.value+rebalanceEvent.duration.value) - currentYear
        const startingAllocations = rebalanceEvent.event.assetAllocation
        const endingAllocations = rebalanceEvent.event.assetAllocation2
        currentYearAllocations = {}
        const duration = rebalanceEvent.duration.value
        

        Object.entries(startingAllocations).forEach(([assetType,initalProportion]) =>{
            const finalProportion = endingAllocations[assetType]
            if(finalProportion == null){
                throw new Error("No corresponding proportion")
            }

            const rate = (finalProportion-initalProportion)/duration
            currentYearAllocations[assetType] = rate*yearsIntoEvent+initalProportion
            
        })
        
        
    }else{
        currentYearAllocations = rebalanceEvent.event.assetAllocation
    }

    return currentYearAllocations
}
/** This is a description of the foo function. */
function processRebalanceEvent(scenario : Scenario,year : number){
    const logMessages : string[] = []
    const allRebalanceEvents = Object.values(scenario.eventSeries).filter((event) => event.event.type == "Rebalance")
    const investmentData = scenario.investmentTypes
    const adjustedAccounts = structuredClone(scenario.investments)

    if(allRebalanceEvents.length == 0){
        return {adjustedAccounts,logMessages}
    }
    
    for(const rebalanceEvent of allRebalanceEvents){
        if(rebalanceEvent.event.type != "Rebalance"){
            throw new Error("Improper filtering, non-rebalance event in rebalance array")
        }

        const taxStatus = rebalanceEvent.event.taxStatus
    }
}
worker({
    simulation : simulation
})
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from "fs"
import path from "path"
import { finished } from "stream/promises"
import {scenarioModel, Scenario} from "../db/Scenario"
import PB from "probability-distributions"
import { Investment } from "../db/InvestmentSchema"
import { FederalTax, taxBracketType,StateTaxBracket, StateTax } from "../db/taxes"
import { worker } from 'workerpool'
import { Event as ScenarioEvent } from "../db/EventSchema"
import { assert } from "console"
import { EventDistribution } from "../db/EventSchema"
import { RMDScraper } from "../scraper/RMDScraper"
import { InvestmentType, IncomeDistribution, ReturnDistribution } from "../db/InvestmentTypesSchema"
import { initalizeCSVLog,writeCSVlog,closeCSVlog, pushToLog as pushToRealLog, incomeEventLogMessage, RMDLogMessage, RothConversionLogMessage, ExpenseLogMessage } from "./logging"

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
        let previousYearIncome = 0.0
        let previousYearSocialSecurityIncome = 0.0
        let filingStatus = 0
        let previousYearEarlyWithdrawals = 0.0
        let previousYearCapitalGains = 0.0
        let currentYearTaxBrackets = baseTaxBrackets
        let previousYearTaxBrackets = baseTaxBrackets
        let solvent = true
        if(scenario.maritalStatus == "couple"){
            filingStatus = 2
        }

        for(let age = startingYear - userBirthYear; age < lifeExpectancy && solvent == true; age++){
            let currentYearTotalIncome = 0.0
            let currentYearCapitalGains = 0.0
            let currentYearEarlyWithdrawals = 0.0

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

            //Income events
            const {totalEventIncome,totalSocialSecurityIncome, adjustedEvents,incomeLogMessages} = 
            processIncome(scenario.eventSeries,inflationRate,spousalStatus,simulatedYear)

            scenario.investments["cash"].value += totalEventIncome
            currentYearTotalIncome += totalEventIncome
            scenario.eventSeries = adjustedEvents
            pushToRealLog(logStream,incomeLogMessages.join("\n"))

            //Perform RMD
            if(age >= 74 && Object.values(scenario.investments).some((investment) => investment.taxStatus == "Pre-tax")){
                if(Object.keys(RMDTable).length === 0){
                    RMDTable = await RMDScraper()
                }
                const {RMDIncome, adjustedAccounts} = performRMD(scenario.investments, scenario.RMDStrategy,RMDTable,age,logStream,simulatedYear)
                currentYearTotalIncome += RMDIncome
                scenario.investments = adjustedAccounts
            }  

            //Update the value of investments
            const {totalInvestmentIncome, updatedAccounts} = updateInvestments(scenario.investmentTypes,scenario.investments)
            scenario.investments = updatedAccounts
            currentYearTotalIncome += totalInvestmentIncome

            //Run roth conversion optimizer if conditions allow
            if(scenario.RothConversionOpt == true && simulatedYear >= scenario.RothConversionStart && simulatedYear <= scenario.RothConversionEnd){
                const {adjustedAccounts, rothConversionIncome } = rothConversionOptimizer(scenario.RothConversionStrategy,scenario.investments,currentYearTaxBrackets["Federal"],
                    currentYearTotalIncome,filingStatus,logStream,simulatedYear)
                scenario.investments = adjustedAccounts
                currentYearTotalIncome += rothConversionIncome
            }

            //Determine and pay taxes and non-discretionary expenses
            const {nonDiscretionaryExpenses,NDExpenseLogMessages} = determineNonDiscretionaryExpenses(scenario.eventSeries,previousYearTaxBrackets,previousYearEarlyWithdrawals,
                previousYearIncome,previousYearCapitalGains,filingStatus,spousalStatus,logStream,simulatedYear)


            const {allExpensesPaid,totalIncome,earlyWithdrawal,totalCapitalGain,adjustedAccounts} = payNonDiscretionaryExpenses(scenario.investments, scenario.investmentTypes,purchaseLedger,
                nonDiscretionaryExpenses, scenario.expenseWithdrawalStrategy,age)
            
            if(allExpensesPaid == false){
                solvent = false
                break;
            }
            scenario.investments = adjustedAccounts
            currentYearCapitalGains += totalCapitalGain
            currentYearEarlyWithdrawals += earlyWithdrawal
            currentYearTotalIncome += totalIncome

            //payDiscretionaryExpenses(scenario.investments, scenario.investmentTypes,
            //    purchaseLedger,scenario.eventSeries,scenario.spendingStrategy,scenario.expenseWithdrawalStrategy,scenario.financialGoal,age)

            //processInvestEvent()

            //processRebalanceEvent()
            simulatedYear += 1
            previousYearIncome = currentYearTotalIncome
            previousYearSocialSecurityIncome = totalSocialSecurityIncome
            previousYearEarlyWithdrawals = currentYearEarlyWithdrawals
            previousYearTaxBrackets = currentYearTaxBrackets
            previousYearCapitalGains = currentYearCapitalGains
            previousYearEarlyWithdrawals = currentYearEarlyWithdrawals
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
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
    })

    federalBrackets.marriedIncomeTaxBrackets.forEach((taxBracket) => {
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
    })

    federalBrackets.singleCapitalGainsTaxBrackets.forEach((taxBracket) => {
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
    })

    federalBrackets.marriedIncomeTaxBrackets.forEach((taxBracket) => {
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
    })

    federalBrackets.singleStandardDeduction += adjustedTaxBrackets.Federal.singleStandardDeduction*inflationRate

    federalBrackets.marriedStandardDeduction += adjustedTaxBrackets.Federal.marriedStandardDeduction*inflationRate

    //Update state brackets
    const stateBrackets = adjustedTaxBrackets.State

    stateBrackets.singleIncomeTax.forEach((taxBracket) =>{
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
    })

    stateBrackets.marriedIncomeTax.forEach((taxBracket) =>{
        taxBracket.lowerThreshold += taxBracket.lowerThreshold*inflationRate
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
            let adjustedEventIncome = 0.0
            const modifiedEvent = structuredClone(currentEvent)

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
            if(currentEvent.event.socialSecurity == true){
                totalEventIncome += eventIncome * SOCIAL_SECURITY_PROPORTION
            }else{
                totalEventIncome += eventIncome
            }
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
function performRMD(investments : Record<string,Investment>, RMDStrategy : string[], RMDTable: Record<number,number>,age : number,
    logStream : WriteStream,year : number){

    let RMDIncome = 0
    if(RMDTable[age] == null){
        throw new Error(`No Required Distribution factor for age ${age}`)
    }
    const adjustedAccounts = structuredClone(investments)
    const preTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "Pre-tax")
    const nonRetirementTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "Non-retirement")
    const logMessages : string[] = [];

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
        requiredDistribution--
        logMessages.push(RMDLogMessage(year, withdrawnAmount, withdrawingAccount.investmentType))
    }

    RMDIncome += requiredDistribution

    return {RMDIncome,adjustedAccounts}


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
    currentYearIncome : number, filingStatus: number, logStream: WriteStream, year : number){

    let incomeTaxBracket : taxBracketType[];
    const adjustedAccounts : Record<string,Investment> = structuredClone(accounts)
    const logMessages : string[] = [];
    
    if(filingStatus > 0){
        incomeTaxBracket = federalTaxBracket.marriedIncomeTaxBrackets
    }else{
        incomeTaxBracket = federalTaxBracket.singleIncomeTaxBrackets
    }

    const upperBracket = incomeTaxBracket.find((bracket) => {
        return currentYearIncome <= bracket.lowerThreshold
    })

    if(upperBracket == undefined){
        throw new Error(`Tax bracket does not exist for income ${currentYearIncome}`)
    }
    const upperThreshold = upperBracket.lowerThreshold
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
        
        logMessages.push(RothConversionLogMessage(year,withdrawnAmount,withdrawingInvestmentType))

    }

    return {adjustedAccounts, rothConversionIncome}

}

function calculateFederalIncomeTax(taxBrackets : FederalTax, income : number,filingStatus : number){

    
    //TP: Generated by Github Copilot with the prompt
    //"create an algorithm that calculates how much I have to pay in US federal taxes given my annual income"
    //Refactored with "Calculate the federal tax burden without knowing the upper threshold of the current tax bracket"

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

    // Iterate through the tax brackets to calculate the tax burden
    for (const bracket of incomeTaxBracket) {
        if (income > bracket.lowerThreshold) {
            const taxableIncome = income - bracket.lowerThreshold;
            taxBurden += taxableIncome * bracket.rate;
            income -= bracket.lowerThreshold; // Reduce income to the lower threshold for the next bracket
        }
    }
    taxBurden -= standardDeduction;
    if (taxBurden < 0) {
        taxBurden = 0;
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

    const capitalGainsRate = capitalGainsTaxBracket.find((bracket) => income <= bracket.lowerThreshold)?.rate
    
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
    //Refactored with "Calculate the federal tax burden without knowing the upper threshold of the current tax bracket"

    let taxBurden = 0.0;
    let incomeTaxBracket : taxBracketType[];
    // Determine the applicable tax brackets based on filing status
    if(filingStatus > 0){
        incomeTaxBracket = taxBrackets.marriedIncomeTax
    }else{
        incomeTaxBracket = taxBrackets.singleIncomeTax

    }

    // Iterate through the tax brackets to calculate the tax burden
    for (const bracket of incomeTaxBracket) {
        if (income > bracket.lowerThreshold) {
            const taxableIncome = income - bracket.lowerThreshold;
            taxBurden += taxableIncome * bracket.rate;
            income -= bracket.lowerThreshold; // Reduce income to the lower threshold for the next bracket
        }
    }
    if (taxBurden < 0) {
        taxBurden = 0;
    }
    return taxBurden;
}
/** Description placeholder */
function determineNonDiscretionaryExpenses(events : Record<string,ScenarioEvent>, 
    taxBrackets: TaxBracketContainer,previousYearEarlyWithdrawals : number, previousYearIncome : number, previousYearCapitalGains : number, 
    filingStatus : number,spousalStatus : boolean, logStream : WriteStream, year : number){
    
    const federalIncomeTaxBurden = calculateFederalIncomeTax(taxBrackets.Federal,previousYearIncome,filingStatus)
    const federalCapitalGainsTaxBurden = calculateFederalCapitalGainsTax(taxBrackets.Federal,previousYearIncome,previousYearCapitalGains,filingStatus)
    const earlyWithdrawalTax = calculateWithdrawalTax(previousYearEarlyWithdrawals)
    const stateTaxBurden = calculateStateIncomeTax(taxBrackets.State,previousYearIncome,filingStatus)
    const NDExpenseLogMessages : string[] = [];

    NDExpenseLogMessages.push(ExpenseLogMessage(year,federalIncomeTaxBurden,"Federal Income"))
    NDExpenseLogMessages.push(ExpenseLogMessage(year,stateTaxBurden,"State Income"))
    NDExpenseLogMessages.push(ExpenseLogMessage(year,federalCapitalGainsTaxBurden,"Federal Income"))
    NDExpenseLogMessages.push(ExpenseLogMessage(year,earlyWithdrawalTax,"Federal Income"))
    
    const eventNonDiscretionaryExpenses = Object.values(events).reduce((accumulatedExpenses, event)=> {
        if(event.event.type == "Expense" && event.event.discretionary == false){
            let expenseAmount : number;
            if(spousalStatus == true){
                expenseAmount = event.event.initialAmount
                NDExpenseLogMessages.push(ExpenseLogMessage(year,expenseAmount,event.name))
                return accumulatedExpenses += expenseAmount
            }else{
                expenseAmount = event.event.initialAmount*event.event.userFraction
                NDExpenseLogMessages.push(ExpenseLogMessage(year,expenseAmount,event.name))
                return accumulatedExpenses += expenseAmount
            }
        }else{
            return accumulatedExpenses
        }
    },0.0)



    const nonDiscretionaryExpenses = federalIncomeTaxBurden + federalCapitalGainsTaxBurden + stateTaxBurden + earlyWithdrawalTax + eventNonDiscretionaryExpenses
    return {nonDiscretionaryExpenses,NDExpenseLogMessages}
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

function payNonDiscretionaryExpenses(accounts : Record<string,Investment>, investmentTypeRecord : Record<string,InvestmentType>,
    purchaseLedger : Record<string, number[]>, totalExpenses : number, expenseWithdrawalStrategy : string[], age : number){
    
    const adjustedAccounts = structuredClone(accounts)
    
    let earlyWithdrawal = 0.0
    let totalIncome = 0.0
    let totalCapitalGain = 0.0
    let allExpensesPaid = false

    const cashWithdrawal = Math.min(adjustedAccounts["cash"].value,totalExpenses)
    totalExpenses -= cashWithdrawal
    adjustedAccounts["cash"].value -= cashWithdrawal

    for(const accountID of expenseWithdrawalStrategy){
        const withdrawingAccount = adjustedAccounts[accountID]
        const currentPurchaseLedger = purchaseLedger[accountID]

        if(withdrawingAccount == null || currentPurchaseLedger == null){
            throw new Error("Invalid investment in expenseWithdrawalStrategy")
        }

        const withdrawnAmount = Math.min(withdrawingAccount.value,totalExpenses)

        //Consider tax implications
        if(withdrawingAccount.taxStatus == "After-tax"){
            //Tax-free accounts
            //Subject to early withdrawal penalties
            //Subject to capital gains

            if(age < EARLY_WITHDRAWAL_AGE){
                earlyWithdrawal += withdrawnAmount
            }
            const capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,withdrawingAccount.value)
            totalCapitalGain += capitalGain

        }else if(withdrawingAccount.taxStatus == "Pre-tax"){
            //Tax-deferred accounts
            //Subject to early withdrawal penalties
            //Subject to income tax

            if(age < EARLY_WITHDRAWAL_AGE){
                earlyWithdrawal += withdrawnAmount
            }

            totalIncome += withdrawnAmount

        }else if(withdrawingAccount.taxStatus == "Non-retirement"){
            //Taxable accounts
            //Subject to capital gains

            const investmentData = investmentTypeRecord[withdrawingAccount.investmentType]
            if(investmentData == null){
                throw new Error("Invalid investment type")
            }
            const capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,withdrawingAccount.value)
            totalCapitalGain += capitalGain
            
        }else{
            throw new Error("Invalid tax status")
        }

        totalExpenses -= withdrawnAmount
        withdrawingAccount.value -= withdrawnAmount

        if(totalExpenses <= 0.0){
            allExpensesPaid = true
            break;
        }
    }


    return {allExpensesPaid,totalIncome,earlyWithdrawal,totalCapitalGain,adjustedAccounts}
}

function determineTaxFromWithdrawal(account : Investment, investmentData : InvestmentType, currentPurchaseLedger : number[], withdrawnAmount : number,
    age : number){
    
    let totalEarlyWithdrawal = 0.0
    let totalCapitalGain = 0.0
    let totalIncome = 0.0
    
    //Consider tax implications
    if(account.taxStatus == "After-tax"){
        //Tax-free accounts
        //Subject to early withdrawal penalties
        //Subject to capital gains

        if(age < EARLY_WITHDRAWAL_AGE){
            totalEarlyWithdrawal += withdrawnAmount
        }
        const capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,account.value)
        totalCapitalGain += capitalGain

    }else if(account.taxStatus == "Pre-tax"){
        //Tax-deferred accounts
        //Subject to early withdrawal penalties
        //Subject to income tax

        if(age < EARLY_WITHDRAWAL_AGE){
            totalEarlyWithdrawal += withdrawnAmount
        }

        totalIncome += withdrawnAmount

    }else if(account.taxStatus == "Non-retirement"){
        //Taxable accounts
        //Subject to capital gains

        if(investmentData == null){
            throw new Error("Invalid investment type")
        }
        const capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,account.value)
        totalCapitalGain += capitalGain
        
    }else{
        throw new Error("Invalid tax status")
    }

    return {totalIncome,totalEarlyWithdrawal,totalCapitalGain}

}
/** Description placeholder */
function payDiscretionaryExpenses(accounts : Record<string,Investment>, investmentDataRecord : Record<string,InvestmentType>,
    purchaseLedger : Record<string,number[]>, expenses : Record<string,ScenarioEvent>, spendingStrategy : string[], expenseWithdrawalStrategy : string[], 
    finanicalGoal: number, age : number){

    const adjustedAccounts = structuredClone(accounts)

    const totalValue = Object.values(accounts).reduce((accumulatedValue, account)=>{
        return accumulatedValue += account.value
    },0.0)

    let expendableValue = totalValue-finanicalGoal
    let earlyWithdrawal = 0.0
    let totalIncome = 0.0
    let totalCapitalGain = 0.0
    let allExpensesPaid = false
    let expenseWithdrawalStrategyIndex = 0

   for(const expenseID in spendingStrategy){
        const currentExpense = expenses[expenseID]

        if(currentExpense.event.type != "Expense"){
            throw new Error("not an expense")
        }

        const expenseAmount = currentExpense.event.initialAmount
        const withdrawingAccountID = expenseWithdrawalStrategy[expenseWithdrawalStrategyIndex]
        const withdrawingAccount = adjustedAccounts[withdrawingAccountID]
        
        
   }
    
    

    return {earlyWithdrawal,totalCapitalGain,adjustedAccounts}

}

/** Description placeholder */
function processInvestEvent(){

}
/** This is a description of the foo function. */
function processRebalanceEvent(){

}
worker({
    simulation : simulation
})
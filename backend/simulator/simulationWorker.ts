/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createWriteStream, WriteStream } from "fs"
import path from "path"
import { finished } from "stream/promises"
import {Scenario} from "../db/Scenario"
import PB from "probability-distributions"
import { Investment } from "../db/InvestmentSchema"
import { FederalTax, taxBracketType, StateTaxBracket, StateTax } from "../db/taxes"
import { worker } from 'workerpool'
import { Event as ScenarioEvent } from "../db/EventSchema"
import { assert } from "console"
import { EventDistribution } from "../db/EventSchema"
import { RMDScraper } from "../scraper/RMDScraper"
import { InvestmentType } from "../db/InvestmentTypesSchema"
import { initalizeCSVLog,writeCSVlog,closeCSVlog, incomeEventLogMessage, RMDLogMessage, expenseLogMessage, rothConversionLogMessage, investLogMessage, pushToLog } from "./logging"
import { AnnualValues, payDiscExpensesReturn, Result, TaxBracketContainer, threadData } from "./simulatorInterfaces"
const USER = 0
const SPOUSE = 1

const EVENT_KEY = 0
const EVENT_DATA = 1
const EARLY_WITHDRAWAL_PENALTY = 0.10
const EARLY_WITHDRAWAL_AGE = 59
const SOCIAL_SECURITY_PROPORTION = 0.85

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


    const userBirthYear = baseScenario.birthYears[0]
    const baseTaxBrackets : TaxBracketContainer = {"Federal": threadData.federalTaxes, "State": threadData.stateTaxes}
    let RMDTable : Record<number,number> = {}

    console.log("Starting")
    const startingYear = new Date().getFullYear();
    for(let simulation = 0; simulation < totalSimulations; simulation++){

        const scenario = structuredClone(baseScenario)
        const lifeExpectancy : number = calculateLifeExpectancy(scenario)
        const spouseLifeExpectancy : number = calculateSpousalLifeExpectancy(scenario)
        let purchaseLedger : Record<string,number[]> = constructPurchaseLedger(scenario.investments)

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

            const inflationRate = resolveDistribution(scenario.inflationAssumption)
            let spousalStatus : boolean;
            if(scenario.maritalStatus == "couple"){
                spousalStatus = determineSpousalStatus(scenario.birthYears[SPOUSE],spouseLifeExpectancy,simulatedYear)
                if(spousalStatus == false && filingStatus > 0){
                    filingStatus--
                }
            }else{
                spousalStatus = false
            }


            //Calculate brackets after inflation
            currentYearTaxBrackets = adjustTaxBracketsForInflation(previousYearTaxBrackets,inflationRate)
            //Calculate annual limits on retirement account contributions after inflation
            const newAfterTaxContributionLimit = adjustRetirementAccountContributionLimit(scenario,inflationRate)
            scenario.afterTaxContributionLimit = newAfterTaxContributionLimit
            
            //Income events
            const processIncomeReturn = processIncome(scenario.eventSeries,inflationRate,spousalStatus,simulatedYear)

            scenario.investments["cash"].value += processIncomeReturn.totalEventIncome
            currentYearValues.totalIncome += processIncomeReturn.totalEventIncome
            scenario.eventSeries = processIncomeReturn.adjustedEvents
            currentYearValues.totalSocialSecurityIncome += processIncomeReturn.totalSocialSecurityIncome
            pushToLog(logStream,processIncomeReturn.incomeLogMessages.join("\n"))

            //Perform RMD
            if(age >= 74 && Object.values(scenario.investments).some((investment) => investment.taxStatus == "pre-tax")){
                if(Object.keys(RMDTable).length === 0){
                    RMDTable = await RMDScraper()
                }
                const RMDReturn = performRMD(scenario.investments, scenario.RMDStrategy,RMDTable,age,simulatedYear)
                currentYearValues.totalIncome += RMDReturn.RMDIncome
                scenario.investments = RMDReturn.adjustedAccounts
                pushToLog(logStream,RMDReturn.RMDLogMessages.join("\n"))

            }  

            //Update the value of investments
            const updateInvestmentReturn = updateInvestments(scenario.investmentTypes,scenario.investments)
            scenario.investments = updateInvestmentReturn.updatedAccounts
            currentYearValues.totalIncome += updateInvestmentReturn.totalInvestmentIncome

            //Run roth conversion optimizer if conditions allow
            if(scenario.RothConversionOpt == true && simulatedYear >= scenario.RothConversionStart && simulatedYear <= scenario.RothConversionEnd){
                const rothConversionReturn = rothConversionOptimizer(scenario,currentYearTaxBrackets["Federal"],currentYearValues.totalIncome,filingStatus,simulatedYear)
                scenario.investments = rothConversionReturn.adjustedAccounts
                currentYearValues.totalIncome += rothConversionReturn.rothConversionIncome
                pushToLog(logStream,rothConversionReturn.rothConversionLogMessages.join('\n'))
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

            const investReturn = processInvestEvent(scenario,simulatedYear,purchaseLedger)
            scenario.investments = investReturn.adjustedAccounts
            purchaseLedger = investReturn.adjustedPurchaseLedger
            pushToLog(logStream,investReturn.logMessages.join('\n'))

            const rebalanceReturn = processRebalanceEvent(scenario,simulatedYear,purchaseLedger)
            scenario.investments = rebalanceReturn.adjustedAccounts
            purchaseLedger = rebalanceReturn.adjustedPurchaseLedger
            pushToLog(logStream,rebalanceReturn.logMessages.join('\n'))
            currentYearValues.totalCapitalGains += rebalanceReturn.totalCapitalGain

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
    if(userLifeExpectancy.type == "fixed"){
        return userLifeExpectancy.value
    }else if(userLifeExpectancy.type == "normal"){
        return Math.round(PB.rnorm(1,userLifeExpectancy.mean,userLifeExpectancy.stdev)[0])
    }else{
        return PB.rint(1,userLifeExpectancy.lower,userLifeExpectancy.upper, 1)[0]
    }
}

function calculateSpousalLifeExpectancy(scenario : Scenario){
    if(scenario.maritalStatus == "individual"){
        return 0
    }else{
        const spousalLifeExpectancy = scenario.lifeExpectancy[SPOUSE]
        if(spousalLifeExpectancy.type == "fixed"){
            return spousalLifeExpectancy.value
        }else if(spousalLifeExpectancy.type == "normal"){
            return Math.round(PB.rnorm(1,spousalLifeExpectancy.mean,spousalLifeExpectancy.stdev)[0])
        }else{
            return PB.rint(1,spousalLifeExpectancy.lower,spousalLifeExpectancy.upper, 1)[0]
        }
    }
}

function resolveDistribution(distribution : EventDistribution): number{
    if(distribution.type == "fixed"){
        return distribution.value
    }else if(distribution.type == "normal"){
        return PB.rnorm(1,distribution.mean,distribution.stdev)[0]
    }else{
        return PB.rint(1,distribution.lower,distribution.upper, 1)[0]
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
            case "fixed":
                realizedDuration = currentEvent.duration.value
                break;
            case "normal":
                realizedDuration = Math.round(PB.rnorm(1, currentEvent.duration.mean, currentEvent.duration.stdev)[0])
                break;
            case "uniform":
                realizedDuration = PB.rint(1, currentEvent.duration.lower, currentEvent.duration.upper, 1)[0]
                break;
        }

        currentEvent.duration = {type: "fixed", value: realizedDuration}

        if(currentEvent.start.type != "startWith" && currentEvent.start.type != "startAfter"){
            //TP: Following code was generate by copilot with three promots
            /* generate all possible cases of currentEvent.duration.start
            make it a switch statement
            remove the code inside the cases */
            switch (currentEvent.start.type) {
                case "fixed":
                    realizedStart = currentEvent.start.value
                break;
                case "normal":
                    realizedStart = Math.round(PB.rnorm(1,currentEvent.start.mean,currentEvent.start.stdev)[0])
                break;
                case "uniform":
                    realizedStart = PB.rint(1,currentEvent.start.lower,currentEvent.start.upper, 1)[0]
                break;
            }
            currentEvent.start = {type: "fixed", value: realizedStart}
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

        if(event.start.type != "startWith" && event.start.type != "startAfter"){
            throw new Error("Event already resolved")
        }

        const parentEvent = resolvedEventSeries[event.start.eventSeries]

        
        if(event.start.type == "startWith"){
            if(parentEvent.start.type != "fixed"){
                dependentEventStack.push(eventKey)
            }else{ 
                event.start = {type: "fixed", value: parentEvent.start.value}
            }
        }else if(event.start.type == "startAfter"){
            if(parentEvent.start.type != "fixed"){
                dependentEventStack.push(eventKey)
            }else{
                if(parentEvent.duration.type != "fixed"){
                    throw new Error("Parent duration hasn't been resolved")
                }
                event.start = {type: "fixed", value: parentEvent.start.value + parentEvent.duration.value}
            }
        }else{
            throw new Error("Event already resolved?")
        }
        
    }

    for(const resolvedEvent of Object.values(resolvedEventSeries)){
        assert(resolvedEvent.start.type == "fixed", "NOT ALL EVENTS RESOVLED")
    }

    return resolvedEventSeries
}

function hasEventStarted(currentEvent : ScenarioEvent, currentYear : number){
    const eventStartType = currentEvent.start.type
    if(eventStartType == "fixed"){
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

        if(currentEvent.event.type == "income"){

            let eventIncome = 0.0
            let adjustedEventIncome
            const modifiedEvent = structuredClone(currentEvent)

            //Determine next year's income
            const incomeChange = resolveDistribution(currentEvent.event.changeDistribution)
            if(currentEvent.event.changeAmtOrPct == "amount"){
                adjustedEventIncome = currentEvent.event.initialAmount + incomeChange
            }else if(currentEvent.event.changeAmtOrPct == "percent"){
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

            if(modifiedEvent.event.type != "income"){
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
    const preTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "pre-tax")
    const nonRetirementTaxAccounts = Object.values(adjustedAccounts).filter((investment) => investment.taxStatus == "non-retirement")
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

        let receivingAccount : Investment | undefined = nonRetirementTaxAccounts.find((investment) => investment.investmentType == withdrawingInvestmentType && investment.taxStatus == "non-retirement")

        if(receivingAccount == undefined){
            receivingAccount = {
                investmentType: withdrawingAccount.investmentType,
                value: 0,
                taxStatus: "non-retirement",
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
        if(currentInvestmentData.returnAmtOrPct == "amount"){
            investmentValueChange = resolveDistribution(currentInvestmentData.returnDistribution)
        }else if(currentInvestmentData.returnAmtOrPct == "percent"){
            investmentValueChange = account.value * resolveDistribution(currentInvestmentData.returnDistribution)
        }else{
            throw new Error("Invalid value change type")
        }

        //Determine income
        if(currentInvestmentData.incomeAmtOrPct == "amount"){
            investmentIncome = resolveDistribution(currentInvestmentData.incomeDistribution)
        }else if(currentInvestmentData.incomeAmtOrPct == "percent"){
            investmentIncome = account.value * resolveDistribution(currentInvestmentData.incomeDistribution)
        }else{
            throw new Error("Invalid income change type")
        }

        if(account.taxStatus == "non-retirement" && currentInvestmentData.taxability == true){
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
function rothConversionOptimizer(scenario : Scenario,federalTaxBracket : FederalTax, currentYearIncome : number, filingStatus: number, year : number){
    
    const rothConversionStrategy = scenario.RothConversionStrategy
    const accounts = scenario.investments
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
        if(withdrawingAccount.taxStatus != "pre-tax"){
            throw new Error("Invalid investment tax status for roth conversion")
        }
        const withdrawingInvestmentType = withdrawingAccount.investmentType
        const withdrawnAmount = Math.min(withdrawingAccount.value, rothConversionAmount)

        let receivingAccount : Investment | undefined = Object.values(accounts).find((investment) => investment.investmentType == withdrawingInvestmentType && investment.taxStatus == "after-tax")

        if(receivingAccount == undefined){
            receivingAccount = {
                investmentType: withdrawingAccount.investmentType,
                value: 0,
                taxStatus: "after-tax",
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

function determineTaxableCapitalGain(currentPurchaseLedger : number[], withdrawalAmount : number, investmentValue : number){
    const purchasePrice = currentPurchaseLedger.reduce((total,price)=>{
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

    const eventExpenses = Object.values(eventSeries).filter((currEvent) => { 
        return currEvent.event.type == "expense" && hasEventStarted(currEvent,year) && currEvent.event.discretionary == false
    }).map((currEvent) =>{
        if(currEvent.event.type != "expense" || !hasEventStarted(currEvent,year)){
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
        if(adjustedEvent.event.type != "expense"){
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
    let expenseSeries :  ExpenseObject[] = []
    const nonDescExpenseLogMessages : string[] = []

    let allExpensesPaid = false
    expenseSeries = expenseSeries.concat(determineTaxBurden(taxBracket,prevYearValues,filingStatus,filingStatus))

    let earlyWithdrawal = 0.0
    let totalIncome = 0.0
    let totalCapitalGain = 0.0
    let expenseWithdrawalStrategyIndex = 0

    const eventExpensesResult = generateExpenseSeriesFromEvents(eventSeries,year,inflationRate,spousalStatus)

    expenseSeries = expenseSeries.concat(eventExpensesResult.eventExpenses)
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

        while(totalExpenses > 0 && expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){

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
    if(event.event.type != "expense"){
        throw new Error("Not an expense, function not applicable")
    }

    let adjustedEventExpense
    const incomeChange = resolveDistribution(event.event.changeDistribution)
    if(event.event.changeAmtOrPct == "amount"){
        adjustedEventExpense = event.event.initialAmount + incomeChange
    }else if(event.event.changeAmtOrPct == "percent"){
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
    if(account.taxStatus == "after-tax"){
        //Tax-free accounts
        //Subject to early withdrawal penalties
        //Subject to capital gains

        if(age < EARLY_WITHDRAWAL_AGE){
            earlyWithdrawal += withdrawnAmount
        }
        capitalGain = determineTaxableCapitalGain(currentPurchaseLedger,withdrawnAmount,account.value)

    }else if(account.taxStatus == "pre-tax"){
        //Tax-deferred accounts
        //Subject to early withdrawal penalties
        //Subject to income tax

        if(age < EARLY_WITHDRAWAL_AGE){
            earlyWithdrawal += withdrawnAmount
        }

        income += withdrawnAmount

    }else if(account.taxStatus == "non-retirement"){
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

        
    for(const expenseID of spendingStrategy){

        //Determine if we have exhausted all our accounts that we can withdraw from
        if(expenseWithdrawalStrategyIndex >= expenseWithdrawalStrategy.length){
            break
        }

        //Determine expenses first
        const currentExpense = adjustedEventSeries[expenseID];
        if(currentExpense.event.type != "expense"){
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

        while(totalExpenses > 0 && expenseWithdrawalStrategyIndex < expenseWithdrawalStrategy.length){

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

   

    return {earlyWithdrawal,totalIncome,totalCapitalGain,adjustedAccounts,adjustedEventSeries,discExpenseLogMessages}

}

function determineAllocation(allocationEvent : ScenarioEvent,currentYear : number){
    if(allocationEvent.event.type != "invest" && allocationEvent.event.type != "rebalance" ){
        throw new Error("Invalid Event: Allocations do not exist for this event")
    }
    
    if(allocationEvent.start.type != "fixed" || allocationEvent.duration.type != "fixed"){
        throw new Error("Event not resolved")
    }

    let currentYearAllocations : Record<string,number>

    if(allocationEvent.event.glidePath == true){
        const yearsIntoEvent = (allocationEvent.start.value+allocationEvent.duration.value) - currentYear
        const startingAllocations = allocationEvent.event.assetAllocation
        const endingAllocations = allocationEvent.event.assetAllocation2
        currentYearAllocations = {}
        const duration = allocationEvent.duration.value
        

        Object.entries(startingAllocations).forEach(([assetType,initalProportion]) =>{
            const finalProportion = endingAllocations[assetType]
            if(finalProportion == null){
                throw new Error("No corresponding proportion")
            }

            const rate = (finalProportion-initalProportion)/duration
            currentYearAllocations[assetType] = rate*yearsIntoEvent+initalProportion
            
        })
        
        
    }else{
        currentYearAllocations = allocationEvent.event.assetAllocation
    }

    return currentYearAllocations
}

/** Non-retirement or after tax */
function processInvestEvent(scenario: Scenario,year : number,purchaseLedger : Record<string, number[]>){
    const logMessages : string[] = []
    const afterTaxContributionLimit = scenario.afterTaxContributionLimit
    const investEvent = Object.values(scenario.eventSeries).find((event) => event.event.type == "invest")
    const cash = scenario.investments["cash"]
    const adjustedAccounts = structuredClone(scenario.investments)
    const adjustedPurchaseLedger = structuredClone(purchaseLedger)

    if(investEvent == null || hasEventStarted(investEvent,year) == false){
        return {adjustedAccounts,adjustedPurchaseLedger,logMessages}
    }

    if(investEvent.event.type != "invest"){
        throw new Error("Invalid Invest Event")
    }
    if(cash == null){
        throw new Error("No cash investment")
    }
    const currYearInvestmentAllocation = determineAllocation(investEvent,year)

    const excessCash = cash.value - investEvent.event.maxCash

    if(excessCash < 0){
        return {adjustedAccounts,adjustedPurchaseLedger,logMessages}
    }else{
        //Determine how the excess cash is distributed


        // const totalInvestmentValue = Object.keys(scenario.investments).reduce((accumulatedValue, currentInvestment)=>{
        //     return accumulatedValue += adjustedAccounts[currentInvestment].value
        // },0.0)

        const realizedInvestmentAllocations : Record<string,number> = {}
        Object.entries(currYearInvestmentAllocation).forEach(([asset,proportion])=>{
            realizedInvestmentAllocations[asset] = (excessCash*proportion)
        })

        const totalAfterTaxContribution = Object.entries(realizedInvestmentAllocations).reduce((totalValue,[asset,contribution]) =>{
            if(adjustedAccounts[asset].taxStatus == "after-tax"){
                totalValue += contribution
            }
            return totalValue
        },0.0)

        if(totalAfterTaxContribution > afterTaxContributionLimit){
            const reductionProportion = afterTaxContributionLimit/totalAfterTaxContribution
            Object.entries(realizedInvestmentAllocations).forEach(([asset,contribution]) =>{

                if(adjustedAccounts[asset].taxStatus == "after-tax"){
                    contribution -= contribution*reductionProportion
                }else{
                    contribution += contribution*reductionProportion
                }
                realizedInvestmentAllocations[asset] = contribution
            })
        }

        //Make the necessary investments
        Object.entries(realizedInvestmentAllocations).map(([asset,contribution]) =>{
            adjustedAccounts[asset].value += contribution
            adjustedPurchaseLedger[asset].push(contribution)
            logMessages.push(investLogMessage(year,contribution,asset))
        })


    }

    return {adjustedAccounts,adjustedPurchaseLedger,logMessages}
}
/** This is a description of the foo function. */
function processRebalanceEvent(scenario : Scenario,year : number,purchaseLedger : Record<string, number[]>){
    const logMessages : string[] = []
    const allRebalanceEvents = Object.values(scenario.eventSeries).filter((event) => event.event.type == "rebalance" && hasEventStarted(event,year))
    const adjustedAccounts = structuredClone(scenario.investments)
    const adjustedPurchaseLedger = structuredClone(purchaseLedger)
    let totalCapitalGain = 0.0

    if(allRebalanceEvents.length == 0){
        return {totalCapitalGain,adjustedAccounts,adjustedPurchaseLedger,logMessages}
    }
    
    for(const rebalanceEvent of allRebalanceEvents){
        if(rebalanceEvent.event.type != "rebalance"){
            throw new Error("Improper filtering, non-rebalance event in rebalance array")
        }

        const taxStatus = rebalanceEvent.event.taxStatus
        const targetAllocation = determineAllocation(rebalanceEvent,year)
        const totalValue = Object.keys(targetAllocation).reduce((totalValue,asset) => totalValue += adjustedAccounts[asset].value,0.0)

        const realizedTargetAllocations : Record<string,number> = {}

        Object.entries(targetAllocation).forEach(([asset,proportion]) =>{
            realizedTargetAllocations[asset] = totalValue*proportion
        })

        Object.entries(realizedTargetAllocations).forEach(([asset,targetValue]) =>{
            const targetAccount = adjustedAccounts[asset]
            const currPurchaseLedger = adjustedPurchaseLedger[asset]
            if(targetAccount.value > targetValue){
                //This is considered a sale
                const saleValue = targetAccount.value - targetValue
                if(taxStatus == "non-retirement"){
                    totalCapitalGain += saleValue
                }
            }else{
                //This is considered a purchase
                const purchaseAmount = targetValue - targetAccount.value
                if(taxStatus == "non-retirement"){
                    currPurchaseLedger.push(purchaseAmount)
                }
            }
            targetAccount.value = targetValue
            
        })
    }

    return {totalCapitalGain,adjustedAccounts,adjustedPurchaseLedger,logMessages}
}
worker({
    simulation : simulation
})
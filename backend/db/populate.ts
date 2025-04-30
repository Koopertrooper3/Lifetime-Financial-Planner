//* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import {Scenario, scenarioModel} from "./Scenario"
import { InvestmentType } from "./InvestmentTypesSchema";
import {Investment} from "./InvestmentSchema"
import { Event } from "./EventSchema";
import {User} from "./User"

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

async function testScenario() {
    await mongoose.connect(databaseConnectionString)
    
    const cashInvestmentType : InvestmentType = {
        name: "cash",
        description: "cash",
        returnAmtOrPct: "amount",
        returnDistribution: {type: "fixed", value: 0},
        expenseRatio: 0,
        incomeAmtOrPct: "percent",
        incomeDistribution: {type: "fixed", value: 0},
        taxability: true
        
    }

    const SNPInvestmentType : InvestmentType = {
        name: "S&P 500",
        description: "S&P 500 index fund",
        returnAmtOrPct: "percent",
        returnDistribution: {type: "normal", mean: 0.06, stdev: 0.02},
        expenseRatio: 0.001,
        incomeAmtOrPct: "amount",
        incomeDistribution: {type: "normal", mean: 0.01, stdev: 0.005},
        taxability: true
        
    }
    const taxExemptBondsInvestmentType : InvestmentType = {
        name: "tax-exempt bonds",
        description: "NY tax-exempt bonds",
        returnAmtOrPct: "amount",
        returnDistribution: {type: "fixed", value: 0},
        expenseRatio: 0.004,
        incomeAmtOrPct: "percent",
        incomeDistribution: {type: "normal", mean: 0.03, stdev: 0.01},
        taxability: false
    }

    const cashInvestment : Investment = {
        investmentType : "cash",
        value: 100,
        taxStatus : "non-retirement",
        id: "cash"
    }

    const snp500Investment : Investment = {
        investmentType : "S&P 500",
        value: 100000,
        taxStatus : "non-retirement",
        id: "S&P 500 non-retirement"
    }

    const taxExemptBondsInvestment : Investment = {
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "non-retirement",
        id: "tax-exempt bonds"
    }

    const snp500InvestmentPreTax : Investment = {
        investmentType : "S&P 500",
        value: 10000,
        taxStatus : "pre-tax",
        id: "S&P 500 pre-tax"
    }
    const snp500InvestmentAfterTax : Investment = {
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "after-tax",
        id: "S&P 500 after-tax"
    }

    const salaryEvent : Event = {
        name: "salary",
        start: {type: "fixed", value: 2025},
        duration: {type: "fixed", value: 40},
        event: {
            type: "income", 
            initialAmount: 75000, 
            changeAmtOrPct: "amount",
            changeDistribution: {type: "uniform", lower: 500, upper: 2000},
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        }
    }

    const foodEvent : Event = {
        name: "food",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 200},
        event: {
            type: "expense", 
            initialAmount: 5000, 
            changeAmtOrPct: "percent",
            changeDistribution: {type: "normal", mean: 0.01, stdev: 0.01},
            inflationAdjusted: true,
            userFraction: 0.5,
            discretionary: false
        }
    }

    const vacationEvent : Event = {
        name: "vacation",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 40},
        event: {
            type: "expense", 
            initialAmount: 1200, 
            changeAmtOrPct: "amount",
            changeDistribution: {type: "fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 0.6,
            discretionary: true
        }
    }

    const streamingEvent : Event = {
        name: "streaming services",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 40},
        event: {
            type: "expense", 
            initialAmount: 500, 
            changeAmtOrPct: "amount",
            changeDistribution: {type: "fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 1.0,
            discretionary: true
        }
    }

    const investEvent : Event = {
        name: "invest",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 10},
        event: {
            type: "invest", 
            assetAllocation: {"S&P 500 non-retirement": 0.6,"S&P 500 after-tax" :0.4},
            glidePath: true,
            assetAllocation2: {"S&P 500 non-retirement": 0.8,"S&P 500 after-tax" :0.2},
            maxCash: 1000
        }
    }

    const rebalanceEvent : Event = {
        name: "rebalance",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 10},
        event: {
            type: "rebalance", 
            assetAllocation: {"S&P 500 non-retirement": 0.7,"S&P 500 after-tax" :0.3},
            glidePath: true,
            assetAllocation2: {"S&P 500 non-retirement": 0.8,"S&P 500 after-tax" :0.2},
            taxStatus: "non-retirement"
        }
    }

    try{
        const exampleScenario : Scenario = {
            name: "Populate Test Scenario",
            maritalStatus: "couple",
            birthYears : [1985,1987],
            lifeExpectancy : [ {type: "fixed", value: 80} , {type: "normal", mean: 82, stdev: 3} ],
            investmentTypes: {"cash" : cashInvestmentType ,"S&P 500" : SNPInvestmentType,"tax-exempt bonds": taxExemptBondsInvestmentType},
            investments: {"cash" :cashInvestment, "S&P 500 non-retirement" :snp500Investment, "tax-exempt bonds": taxExemptBondsInvestment,"S&P 500 pre-tax": snp500InvestmentPreTax,"S&P 500 after-tax": snp500InvestmentAfterTax},
            eventSeries: {"salary": salaryEvent, "food": foodEvent, "vacation": vacationEvent, "streaming services": streamingEvent,"my investments": investEvent, "rebalance": rebalanceEvent},
            inflationAssumption: {type: "fixed", value: 0.03},
            afterTaxContributionLimit: 7000,
            spendingStrategy: ["vacation", "streaming services"],
            expenseWithdrawalStrategy: ["S&P 500 non-retirement", "tax-exempt bonds", "S&P 500 after-tax"],
            RMDStrategy: ["S&P 500 pre-tax"],
            RothConversionOpt: true,
            RothConversionStart: 2050,
            RothConversionEnd: 2060,
            RothConversionStrategy: ["S&P 500 pre-tax"],
            financialGoal: 10000,
            residenceState: "NY",
        }
        const scenarioResult = await scenarioModel.create(exampleScenario)
        const anyUser = await User.findOne({})
        if(anyUser == null){
            throw new Error("No users")
        }
        await User.findOneAndUpdate({ _id: anyUser._id },{ ownedScenarios: [scenarioResult._id] })
    }catch(err){
        console.log(err)
    }
    
    return
}


testScenario().then(() => {
    process.exit()})
//* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import {Scenario, scenarioModel} from "./Scenario"
import { InvestmentType } from "./InvestmentTypesSchema";
import Distribution from "./Distribution";
import {Investment, investmentSchema} from "./InvestmentSchema"
import { Event } from "./EventSchema";
import { fixedValueSchema,normalDistSchema,uniformDistSchema } from './DistributionSchemas';
import User from "./User"

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

async function testScenario() {
    await mongoose.connect(databaseConnectionString)
    
    const cashInvestmentType : InvestmentType = {
        name: "cash",
        description: "cash",
        returnAmtOrPct: "Amount",
        returnDistribution: {type: "Fixed", value: 0},
        expenseRatio: 0,
        incomeAmtOrPct: "Percent",
        incomeDistribution: {type: "Fixed", value: 0},
        taxability: true
        
    }

    const SNPInvestmentType : InvestmentType = {
        name: "S&P 500",
        description: "S&P 500 index fund",
        returnAmtOrPct: "Percent",
        returnDistribution: {type: "Normal", mean: 0.06, stdev: 0.02},
        expenseRatio: 0,
        incomeAmtOrPct: "Amount",
        incomeDistribution: {type: "Normal", mean: 0.01, stdev: 0.005},
        taxability: true
        
    }
    const taxExemptBondsInvestmentType : InvestmentType = {
        name: "tax-exempt bonds",
        description: "NY tax-exempt bonds",
        returnAmtOrPct: "Amount",
        returnDistribution: {type: "Fixed", value: 0},
        expenseRatio: 0.004,
        incomeAmtOrPct: "Percent",
        incomeDistribution: {type: "Normal", mean: 0.03, stdev: 0.01},
        taxability: false
    }

    const cashInvestment : Investment = {
        investmentType : "cash",
        value: 100,
        taxStatus : "Non-retirement",
        id: "cash"
    }

    const snp500Investment : Investment = {
        investmentType : "S&P 500",
        value: 100000,
        taxStatus : "Non-retirement",
        id: "S&P 500 non-retirement"
    }

    const taxExemptBondsInvestment : Investment = {
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "Non-retirement",
        id: "tax-exempt bonds"
    }

    const snp500InvestmentPreTax : Investment = {
        investmentType : "S&P 500",
        value: 10000,
        taxStatus : "Pre-tax",
        id: "S&P 500 pre-tax"
    }
    const snp500InvestmentAfterTax : Investment = {
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "After-tax",
        id: "S&P 500 after-tax"
    }

    const salaryEvent : Event = {
        name: "salary",
        start: {type: "Fixed", value: 2025},
        duration: {type: "Fixed", value: 40},
        event: {
            type: "Income", 
            initialAmount: 75000, 
            changeAmountOrPercent: "Amount",
            changeDistribution: {type: "Uniform", min: 500, max: 2000},
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        }
    }

    const foodEvent : Event= {
        name: "food",
        start: {type: "EventBased", withOrAfter: "With", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initialAmount: 5000, 
            changeAmountOrPercent: "Percent",
            changeDistribution: {type: "Normal", mean: 0.01, stdev: 0.01},
            inflationAdjusted: true,
            userFraction: 0.5,
            discretionary: false
        }
    }

    const vacationEvent : Event = {
        name: "vacation",
        start: {type: "EventBased", withOrAfter: "With", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initialAmount: 1200, 
            changeAmountOrPercent: "Amount",
            changeDistribution: {type: "Fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 0.6,
            discretionary: true
        }
    }

    const streamingEvent : Event = {
        name: "streaming services",
        start: {type: "EventBased", withOrAfter: "With", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initialAmount: 500, 
            changeAmountOrPercent: "Amount",
            changeDistribution: {type: "Fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 1.0,
            discretionary: true
        }
    }

    const investEvent : Event = {
        name: "invest",
        start: {type: "EventBased", withOrAfter: "With", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Invest", 
            assetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.6},{asset: "S&P 500 non-retirement", proportion: 0.4}],
            glidePath: true,
            assetAllocation2: [{asset: "S&P 500 non-retirement", proportion: 0.8},{asset: "S&P 500 non-retirement", proportion: 0.2}],
            maxCash: 1000
        }
    }

    const rebalanceEvent : Event = {
        name: "rebalance",
        start: {type: "EventBased", withOrAfter: "With", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Rebalance", 
            assetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.7},{asset: "S&P 500 non-retirement", proportion: 0.3}],

        }
    }

    try{
        const exampleScenario = await scenarioModel.create({
            name: "reimu",
            maritalStatus: "couple",
            birthYear : [1985,1987],
            lifeExpectancy : [ {type: "Fixed", value: 80} , {type: "Normal", mean: 82, stdev: 3} ],
            investmentTypes: [cashInvestmentType,SNPInvestmentType,taxExemptBondsInvestmentType],
            investments: [cashInvestment,snp500Investment,taxExemptBondsInvestment,snp500InvestmentPreTax,snp500InvestmentAfterTax],
            eventSeries: [salaryEvent,foodEvent,vacationEvent,streamingEvent,investEvent,rebalanceEvent],
            inflationAssumption: {type: "Fixed", value: 80},
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
        })
    

        await User.findOneAndUpdate({ name: "Christian Yu" },{ ownedScenarios: [exampleScenario._id] })
    }catch(error){
        console.log(error)
    }
    return
}


testScenario().then(() => {
    process.exit()})
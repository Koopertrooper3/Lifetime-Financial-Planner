/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import {Scenario, scenarioModel} from "./Scenario"
import InvestmentType from "./InvestmentTypes";
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
    
    const cashInvestmentType = await InvestmentType.create({
        name: "cash",
        description: "cash",
        returnAmtOrPct: "amount",
        returnDistribution: await Distribution.create({
            type: "fixed",
            value: 0
        }),
        expenseRatio: 0,
        incomeAmtOrPct: "percent",
        incomeDistribution: await Distribution.create({
            type: "fixed",
            value: 0
        }),
        taxability: true
        
    })

    const SNPInvestmentType = await InvestmentType.create({
        name: "S&P 500",
        description: "S&P 500 index fund",
        returnAmtOrPct: "percent",
        returnDistribution: await Distribution.create({
            type: "percent",
            mean: 0.06,
            stdev: 0.02,
        }),
        expenseRatio: 0,
        incomeAmtOrPct: "percent",
        incomeDistribution: await Distribution.create({
            type: "normal",
            mean: 0.01,
            stdev: 0.005
        }),
        taxability: true
        
    })
    const taxExemptBondsInvestmentType = await InvestmentType.create({
        name: "tax-exempt bonds",
        description: "NY tax-exempt bonds",
        returnAmtOrPct: "amount",
        returnDistribution: await Distribution.create({
            type: "fixed",
            value: 0
        }),
        expenseRatio: 0.004,
        incomeAmtOrPct: "percent",
        incomeDistribution: await Distribution.create({
            type: "normal",
            mean: 0.03,
            stdev: 0.01
        }),
        taxability: false
        
    })

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

    const salaryEvent = {
        name: "salary",
        start: {type: "Fixed", value: 2025},
        duration: {type: "Fixed", value: 40},
        event: {
            type: "Income", 
            initalAmount: 75000, 
            changeAmountOrPecent: "amount",
            changeDistribution: {type: "Uniform", lower: 500, upper: 2000},
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        }
    }

    const foodEvent = {
        name: "food",
        start: {type: "EventBased", withOrAfter: "with", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initalAmount: 5000, 
            changeAmountOrPecent: "percent",
            changeDistribution: {type: "Normal", mean: 0.01, stdev: 0.01},
            inflationAdjusted: true,
            userFraction: 0.5,
            discretionary: false
        }
    }

    // const vacationEvent = await Event.create({
    //     name: "food",
    //     start: {type: "EventBased", withOrAfter: "with", event: salaryEvent._id},
    //     duration: {type: "Fixed", value: 40},
    //     event: {
    //         type: "Expense", 
    //         initalAmount: 1200, 
    //         changeAmountOrPecent: "amount",
    //         changeDistribution: {type: "Fixed", value: 0},
    //         inflationAdjusted: true,
    //         userFraction: 0.6,
    //         discretionary: true
    //     }
    // })

    const vacationEvent : Event = {
        name: "vacation",
        start: {type: "EventBased", withOrAfter: "with", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initalAmount: 1200, 
            changeAmountOrPercent: "amount",
            changeDistribution: {type: "Fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 0.6,
            discretionary: true
        }
    }

    // const streamingEvent = await Event.create({
    //     name: "food",
    //     start: {type: "EventBased", withOrAfter: "with", event: salaryEvent._id},
    //     duration: {type: "Fixed", value: 40},
    //     event: {
    //         type: "Expense", 
    //         initalAmount: 500, 
    //         changeAmountOrPecent: "amount",
    //         changeDistribution: {type: "Fixed", value: 0},
    //         inflationAdjusted: true,
    //         userFraction: 1.0,
    //         discretionary: true
    //     }
    // })

    const streamingEvent : Event = {
        name: "streaming services",
        start: {type: "EventBased", withOrAfter: "with", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Expense", 
            initalAmount: 500, 
            changeAmountOrPercent: "amount",
            changeDistribution: {type: "Fixed", value: 0},
            inflationAdjusted: true,
            userFraction: 1.0,
            discretionary: true
        }
    }
    // const investEvent = await Event.create({
    //     start: {type: "Uniform", lower: 2025, upper: 2030},
    //     duration: {type: "Fixed", value: 10},
    //     event: {
    //         type: "Invest", 
    //         AssetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.6},{asset: "S&P 500 non-retirement", proportion: 0.4}],
    //         glidePath: true,
    //         AssetAllocation2: [{asset: "S&P 500 non-retirement", proportion: 0.8},{asset: "S&P 500 non-retirement", proportion: 0.2}],
    //         maxCash: 1000
    //     }
    // })
    const investEvent : Event = {
        name: "invest",
        start: {type: "EventBased", withOrAfter: "with", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Invest", 
            assetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.6},{asset: "S&P 500 non-retirement", proportion: 0.4}],
            glidePath: true,
            assetAllocation2: [{asset: "S&P 500 non-retirement", proportion: 0.8},{asset: "S&P 500 non-retirement", proportion: 0.2}],
            maxCash: 1000
        }
    }
    // const rebalanceEvent = await Event.create({
    //     start: {type: "Uniform", lower: 2025, upper: 2030},
    //     duration: {type: "Fixed", value: 10},
    //     event: {
    //         type: "Rebalance", 
    //         AssetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.7},{asset: "S&P 500 non-retirement", proportion: 0.3}],

    //     }
    // })

    const rebalanceEvent : Event = {
        name: "rebalance",
        start: {type: "EventBased", withOrAfter: "with", event: "salary"},
        duration: {type: "Fixed", value: 200},
        event: {
            type: "Rebalance", 
            assetAllocation: [{asset: "S&P 500 non-retirement", proportion: 0.7},{asset: "S&P 500 non-retirement", proportion: 0.3}],

        }
    }


   
    const exampleScenario = await scenarioModel.create({
        name: "reimu",
        maritalStatus: "couple",
        birthYear : [1985,1987],
        lifeExpectancy : [ {type: "Fixed", value: 80} , {type: "Normal", mean: 82, stdev: 3} ],
        investmentTypes: [cashInvestmentType._id,SNPInvestmentType._id,taxExemptBondsInvestmentType._id],
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
    return
}


testScenario().then(() => {
    process.exit()})
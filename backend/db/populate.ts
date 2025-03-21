/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import Scenario from "./Scenario"
import InvestmentType from "./InvestmentTypes";
import Distribution from "./Distribution";
import Investments from "./Investments"
import {eventSeries} from "./EventSeries";

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

    const cashInvestment = await Investments.create({
        investmentType : "cash",
        value: 100,
        taxStatus : "non-retirement",
        id: "cash"
    })

    const snp500Investment = await Investments.create({
        investmentType : "S&P 500",
        value: 100000,
        taxStatus : "non-retirement",
        id: "S&P 500 non-retirement"
    })
    const taxExemptBondsInvestment = await Investments.create({
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "non-retirement",
        id: "tax-exempt bonds"
    })
    const snp500InvestmentPreTax = await Investments.create({
        investmentType : "S&P 500",
        value: 10000,
        taxStatus : "pre-tax",
        id: "S&P 500 pre-tax"
    })
    const snp500InvestmentAfterTax = await Investments.create({
        investmentType : "S&P 500",
        value: 2000,
        taxStatus : "after-tax",
        id: "S&P 500 after-tax"
    })

   
    const exampleScenario = new Scenario({
        name: "reimu",
        maritalStatus: "couple",
        birthYear : 2024,
        lifeExpectancy : {type: "fixed",value: 80},
        investmentTypes: [cashInvestmentType,SNPInvestmentType,taxExemptBondsInvestmentType],
        investments: [cashInvestment,snp500Investment,taxExemptBondsInvestment,snp500InvestmentPreTax,snp500InvestmentAfterTax]
    })

}


testScenario().then(() => {process.exit()})
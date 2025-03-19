import { chromium, firefox } from 'playwright';
import {federalTaxModel, taxBracketSchema, taxBracketType} from '../db/taxes.js'
import mongoose from "mongoose"
import { exit } from 'process';
import dotenv from "dotenv"

dotenv.config()

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName 

const federalIncomeTaxRatesWebsite = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
const federalStandardDeductionWebsite = "https://www.irs.gov/publications/p17"
const federalCapitalGainsTaxRateWebsite = "https://www.irs.gov/taxtopics/tc409"

export async function federalIncomeTaxScraper(){
    await mongoose.connect(databaseConnectionString);

    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto(federalIncomeTaxRatesWebsite);


    const taxTables = await page.getByRole("table",{includeHidden: true}).all()


    const singleFilingIncomeTaxTable = await taxTables[0].getByRole("rowgroup").all().then(
        async (incomeTaxTable) => { return await incomeTaxTable[1].getByRole("row").all()}
    );

    const marriedFilingIncomeTaxTable = await taxTables[0].getByRole("rowgroup").all().then(
        async (incomeTaxTable) => { return await incomeTaxTable[1].getByRole("row").all()}
    );

    const yearRegex = /\d{4}/g
    const taxYear = await page.getByRole("heading",{name: "tax rates for a single taxpayer"})
    .textContent()
    .then(
        (taxYearHeading) => taxYearHeading != null ? Number(yearRegex.exec(taxYearHeading)) : 0
    )

    let newFederalTaxBrackets = new federalTaxModel({year: taxYear});


    //For single filed income taxes
    for (const row of singleFilingIncomeTaxTable){
        const cells = await row.getByRole("cell").all()

        let taxRate : string;
        let lowerThreshold : string;
        let upperThreshold : string;

        [taxRate,lowerThreshold,upperThreshold] = await Promise.all([cells[0].innerHTML(),cells[1].innerHTML(),cells[2].innerHTML()]);
        let USDFormattingRegex = /[$,]/g;

        let taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%',''))/100,
            lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex,'')),
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ?  Infinity : Number(upperThreshold.replace(USDFormattingRegex,''))
        }

        newFederalTaxBrackets.singleIncomeTaxBrackets.push(taxBracket)
    }

    //For jointly filed income taxes
    for (const row of marriedFilingIncomeTaxTable){
        const cells = await row.getByRole("cell").all()

        let taxRate : string
        let lowerThreshold : string 
        let upperThreshold : string

        [taxRate,lowerThreshold,upperThreshold] = await Promise.all([cells[0].innerHTML(),cells[1].innerHTML(),cells[2].innerHTML()])
        let USDFormattingRegex = /[$,]/g

        let taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%',''))/100,
            lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex,'')),
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ?  Infinity : Number(upperThreshold.replace(USDFormattingRegex,''))
        }

        newFederalTaxBrackets.marriedIncomeTaxBrackets.push(taxBracket)
    }

    await page.goto(federalStandardDeductionWebsite);

    const standardDeductionTable = await page
    .getByRole("table",{includeHidden: true, name:"Table 10-1.Standard Deduction Chart for Most People*"})
    .getByRole("row").all()

    for(const row of standardDeductionTable){
        const cells = await row.getByRole("cell").all()
        console.log(await cells[0].innerHTML())
        let USDFormattingRegex = /[$,]/g;

        let deductionType : String
        let deduction : String

        deductionType = await cells[0].innerHTML();

        if(deductionType == "Single or Married filing separately"){
            deduction = await cells[1].innerHTML()
            newFederalTaxBrackets.singleStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''))
        }else if(deductionType == "Married filing jointly or Qualifying surviving spouse"){
            deduction = await cells[1].innerHTML()
            newFederalTaxBrackets.marriedStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''))
        }
    }

    const hasDollarValueRegex = /\$\d*,\d*/g
    const taxRateElement = 0
    const bracketIncomeElement = 1
    const possibleTaxRateStringRegex = /capital gains rate of\xa0\d*%/g
    const taxRateRegex = /(\d*%)/g


    await page.goto(federalCapitalGainsTaxRateWebsite);

    const mainBody = await page.getByRole("article");

    const [possibleRates, possibleIncomes] = await Promise.all(
        [mainBody.getByRole("paragraph").filter({hasText : "capital gains rate of"}).all(),
        mainBody.getByRole("list").filter({hasText: hasDollarValueRegex}).all()
        ])
    

    const possibleIncomeAndRates = possibleRates.map((k,i) => [k,possibleIncomes?.at(i) != null ? possibleIncomes[i] : null])
    let maxLimit = {"single": 0, "married": 0}

    for(const bracket of possibleIncomeAndRates){

        let taxRate = await bracket[taxRateElement]!.textContent().then( (paragraph) =>paragraph?.match(possibleTaxRateStringRegex)?.[0].match(taxRateRegex)?.[0]?.replace('%','') || null )

        if(bracket[bracketIncomeElement] != null){

            const income = bracket[bracketIncomeElement]
            let singleFiling = income.getByRole("listitem").filter({hasText: "single"}).textContent().then( textOfElement => textOfElement?.match(hasDollarValueRegex) || [])
            let marriedFiling = income.getByRole("listitem").filter({hasText: "married filing jointly"}).textContent().then( textOfElement => textOfElement?.match(hasDollarValueRegex) || [])

            const [singlesBracket, marriedBracket] = await Promise.all(
            [   singleFiling,
                marriedFiling
            ])
            let USDFormattingRegex = /[$,]/g;

            if(singlesBracket?.length == 1){
                let singleLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''))
                let taxBracket : taxBracketType = {
                    rate : Number(taxRate)/100,
                    lowerThreshold: 0,
                    upperThreshold :  singleLimit
                }
                console.log(taxBracket)
                newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket)

            }else{

                let firstLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''))
                let secondLimit = Number(singlesBracket[1].replace(USDFormattingRegex, ''))

                if(firstLimit < secondLimit){
                    let taxBracket : taxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: firstLimit,
                        upperThreshold :  secondLimit
                    }
                    maxLimit["single"] = Math.max(secondLimit,maxLimit["single"])
                    console.log(taxBracket)

                    newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket)
                }else{
                    let taxBracket : taxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: secondLimit,
                        upperThreshold :  firstLimit
                    }
                    maxLimit["single"] = Math.max(firstLimit,maxLimit["single"])
                    console.log(taxBracket)

                    newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket)
                }
            }

            if(marriedBracket?.length == 1){
                let singleLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''))
                let taxBracket : taxBracketType = {
                    rate : Number(taxRate)/100,
                    lowerThreshold: 0,
                    upperThreshold :  singleLimit
                }
                newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket)

            }else{
                let firstLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''))
                let secondLimit = Number(marriedBracket[1].replace(USDFormattingRegex, ''))

                if(firstLimit < secondLimit){
                    let taxBracket : taxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: firstLimit,
                        upperThreshold :  secondLimit
                    }
                    maxLimit["married"] = Math.max(secondLimit,maxLimit["married"])
                    console.log(taxBracket)

                    newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket)
                }else{
                    let taxBracket : taxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: secondLimit,
                        upperThreshold :  firstLimit
                    }
                    maxLimit["married"] = Math.max(firstLimit,maxLimit["married"])
                    console.log(taxBracket)

                    newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket)
                }
            }
        }else{
            let singleTaxBracket : taxBracketType = {
                rate : Number(taxRate)/100,
                lowerThreshold: maxLimit["single"],
                upperThreshold : Infinity
            }
            let marriedTaxBracket : taxBracketType = {
                rate : Number(taxRate)/100,
                lowerThreshold: maxLimit["married"],
                upperThreshold : Infinity
            }
            newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(singleTaxBracket)
            newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(marriedTaxBracket)




        }

    }

    await newFederalTaxBrackets.save()
    await browser.close();
    exit()
};

async function federalIncomeTax(){

}

async function federalStandardDeductions(){
    
}
async function capitalGainsTax() {

}

federalIncomeTaxScraper()

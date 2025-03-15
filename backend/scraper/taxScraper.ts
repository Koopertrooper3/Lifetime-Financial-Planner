import { chromium, firefox } from 'playwright';
import {taxModel, taxBracketSchema, taxBracketType} from '../db/taxes.js'
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
const federalCapitalGainsWebsite = "https://www.irs.gov/taxtopics/tc409"

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

    let newFederalTaxBrackets = new taxModel({year: taxYear, taxType : "federal"});


    //For single filed income taxes
    for (const row of singleFilingIncomeTaxTable){
        const cells = await row.getByRole("cell").all()

        let taxRate : string;
        let lowerThreshold : string;
        let upperThreshold : string;

        [taxRate,lowerThreshold,upperThreshold] = await Promise.all([cells[0].innerHTML(),cells[1].innerHTML(),cells[2].innerHTML()]);
        let USDFormatting = /[$,]/g;

        let taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%','')),
            lowerThreshold: Number(lowerThreshold.replace(USDFormatting,'')),
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormatting, ''))) ?  999999 : Number(upperThreshold.replace(USDFormatting,''))
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
        let USDFormatting = /[$,]/g

        let taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%','')),
            lowerThreshold: Number(lowerThreshold.replace(USDFormatting,'')),
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormatting, ''))) ?  999999 : Number(upperThreshold.replace(USDFormatting,''))
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
        let USDFormatting = /[$,]/g;

        let deductionType : String
        let deduction : String

        deductionType = await cells[0].innerHTML();

        if(deductionType == "Single or Married filing separately"){
            deduction = await cells[1].innerHTML()
            newFederalTaxBrackets.singleStandardDeduction = Number(deduction.replace(USDFormatting, ''))
        }else if(deductionType == "Married filing jointly or Qualifying surviving spouse"){
            deduction = await cells[1].innerHTML()
            newFederalTaxBrackets.marriedStandardDeduction = Number(deduction.replace(USDFormatting, ''))
        }
    }

    await newFederalTaxBrackets.save()
    await browser.close();
    exit()
};

async function test1(){
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();



    const CapitalGainsCategory1 = await page.locator("/html/body/div[2]/div[3]/div/div[2]/div/article/div/div").getByRole("list").all()



    await page.goto(federalCapitalGainsWebsite);
}
federalIncomeTaxScraper()
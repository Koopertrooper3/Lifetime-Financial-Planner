import {firefox} from 'playwright';
import {federalTaxModel, taxBracketType,FederalTax, CapitalGainsTaxBracketType} from "../db/taxes"
import dotenv from "dotenv"
import path from 'path';

dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')})

const federalIncomeTaxRatesWebsite = process.env.FEDERAL_INCOME_TAX_RATES_WEBSITE || "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
const federalStandardDeductionWebsite = process.env.FEDERAL_STANDARD_DEDUCTION_WEBSITE || "https://www.irs.gov/publications/p17"
const federalCapitalGainsTaxRateWebsite = process.env.FEDERAL_CAPITAL_GAINS_TAX_RATE_WEBSITE || "https://www.irs.gov/taxtopics/tc409";

const USDFormattingRegex = /[$,]/g;
const yearRegex = /\d{4}/g

export async function federalTaxScraper(){
    
    const federalTaxes : FederalTax = {
        year: await getTaxYear(),
        singleIncomeTaxBrackets: [],
        marriedIncomeTaxBrackets: [],
        singleStandardDeduction: 0,
        marriedStandardDeduction: 0,
        singleCapitalGainsTaxBrackets: [],
        marriedcapitalGainsTaxBrackets: []
    }

    const [singleIncomeTaxBracket, marriedIncomeTaxBrackets] = await federalIncomeTax()

    federalTaxes.singleIncomeTaxBrackets = singleIncomeTaxBracket
    federalTaxes.marriedIncomeTaxBrackets = marriedIncomeTaxBrackets

    const [singleFederalDeduction, marriedFederalDeduction] = await federalStandardDeductions()

    federalTaxes.singleStandardDeduction = singleFederalDeduction
    federalTaxes.marriedStandardDeduction = marriedFederalDeduction

    const [singleCapitalGainsTaxBrackets,marriedcapitalGainsTaxBrackets] = await capitalGainsTax()

    federalTaxes.singleCapitalGainsTaxBrackets = singleCapitalGainsTaxBrackets
    federalTaxes.marriedcapitalGainsTaxBrackets = marriedcapitalGainsTaxBrackets

    federalTaxModel.create(federalTaxes)
    console.log("scraper done!")
};

async function federalIncomeTax(){
    const singleIncomeTaxBrackets = []
    const marriedIncomeTaxBrackets = []

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

    //For single filed income taxes
    for (const row of singleFilingIncomeTaxTable){
        const cells = await row.getByRole("cell").all()

        const [taxRate,upperThreshold] = await Promise.all([cells[0].innerHTML(),cells[2].innerHTML()]);

        const taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%',''))/100,
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ?  Infinity : Number(upperThreshold.replace(USDFormattingRegex,''))
        }

        singleIncomeTaxBrackets.push(taxBracket)
    }

    //For jointly filed income taxes
    for (const row of marriedFilingIncomeTaxTable){
        const cells = await row.getByRole("cell").all()

        const [taxRate,upperThreshold] = await Promise.all([cells[0].innerHTML(),cells[2].innerHTML()])

        const taxBracket : taxBracketType = {
            rate : Number(taxRate.replace('%',''))/100,
            upperThreshold :  Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ?  Infinity : Number(upperThreshold.replace(USDFormattingRegex,''))
        }

        marriedIncomeTaxBrackets.push(taxBracket)
    }

    return [singleIncomeTaxBrackets,marriedIncomeTaxBrackets]
}

async function federalStandardDeductions(){
    let singleStandardDeduction = 0;
    let marriedStandardDeduction = 0;

    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto(federalStandardDeductionWebsite);

    const standardDeductionTable = await page
    .getByRole("table",{includeHidden: true, name:"Table 10-1.Standard Deduction Chart for Most People*"})
    .getByRole("row").all()

    for(const row of standardDeductionTable){
        const cells = await row.getByRole("cell").all()

        let deduction : string

        const deductionType = await cells[0].innerHTML();

        if(deductionType == "Single or Married filing separately"){
            deduction = await cells[1].innerHTML()
            singleStandardDeduction = Number(deduction.replace(USDFormattingRegex, '')) || 0
        }else if(deductionType == "Married filing jointly or Qualifying surviving spouse"){
            deduction = await cells[1].innerHTML()
            marriedStandardDeduction = Number(deduction.replace(USDFormattingRegex, '')) || 0
        }
    }

    return [singleStandardDeduction,marriedStandardDeduction]
}
async function capitalGainsTax() {
    const singleCapitalGainsTaxBrackets = []
    const marriedcapitalGainsTaxBrackets = []

    const hasDollarValueRegex = /\$\d*(?:,\d*)*/g ///\$\d*,\d*/g
    const taxRateElement = 0
    const bracketIncomeElement = 1
    const possibleTaxRateStringRegex = /capital gains rate of\xa0\d*%/g
    const taxRateRegex = /(\d*%)/g

    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto(federalCapitalGainsTaxRateWebsite);

    const mainBody = await page.getByRole("article");

    const [possibleRates, possibleIncomes] = await Promise.all(
        [mainBody.getByRole("paragraph").filter({hasText : "capital gains rate of"}).all(),
        mainBody.getByRole("list").filter({hasText: hasDollarValueRegex}).all()
        ])
    

    const possibleIncomeAndRates = possibleRates.map((k,i) => [k,possibleIncomes?.at(i) != null ? possibleIncomes[i] : null])
    const maxLimit = {"single": 0, "married": 0}

    for(const bracket of possibleIncomeAndRates){

        const taxRate = await bracket[taxRateElement]?.textContent().then( (paragraph) =>paragraph?.match(possibleTaxRateStringRegex)?.[0].match(taxRateRegex)?.[0]?.replace('%','') || null )

        if(bracket[bracketIncomeElement] != null){

            const income = bracket[bracketIncomeElement]
            const singleFiling = income.getByRole("listitem").filter({hasText: "single"}).textContent().then( textOfElement => textOfElement?.match(hasDollarValueRegex) || [])
            const marriedFiling = income.getByRole("listitem").filter({hasText: "married filing jointly"}).textContent().then( textOfElement => textOfElement?.match(hasDollarValueRegex) || [])

            const [singlesBracket, marriedBracket] = await Promise.all(
            [   singleFiling,
                marriedFiling
            ])

            if(singlesBracket?.length == 1){
                const singleLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''))
                const taxBracket : CapitalGainsTaxBracketType = {
                    rate : Number(taxRate)/100,
                    lowerThreshold: 0,
                    upperThreshold :  singleLimit
                }
                singleCapitalGainsTaxBrackets.push(taxBracket)

            }else{

                const firstLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''))
                const secondLimit = Number(singlesBracket[1].replace(USDFormattingRegex, ''))

                if(firstLimit < secondLimit){
                    const taxBracket : CapitalGainsTaxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: firstLimit,
                        upperThreshold :  secondLimit
                    }
                    maxLimit["single"] = Math.max(secondLimit,maxLimit["single"])

                    singleCapitalGainsTaxBrackets.push(taxBracket)
                }else{
                    const taxBracket : CapitalGainsTaxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: secondLimit,
                        upperThreshold :  firstLimit
                    }
                    maxLimit["single"] = Math.max(firstLimit,maxLimit["single"])

                    singleCapitalGainsTaxBrackets.push(taxBracket)
                }
            }

            if(marriedBracket?.length == 1){
                const singleLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''))
                const taxBracket : CapitalGainsTaxBracketType = {
                    rate : Number(taxRate)/100,
                    lowerThreshold: 0,
                    upperThreshold :  singleLimit
                }
                marriedcapitalGainsTaxBrackets.push(taxBracket)

            }else{
                const firstLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''))
                const secondLimit = Number(marriedBracket[1].replace(USDFormattingRegex, ''))

                if(firstLimit < secondLimit){
                    const taxBracket : CapitalGainsTaxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: firstLimit,
                        upperThreshold :  secondLimit
                    }
                    maxLimit["married"] = Math.max(secondLimit,maxLimit["married"])

                    marriedcapitalGainsTaxBrackets.push(taxBracket)
                }else{
                    const taxBracket : CapitalGainsTaxBracketType = {
                        rate : Number(taxRate)/100,
                        lowerThreshold: secondLimit,
                        upperThreshold :  firstLimit
                    }
                    maxLimit["married"] = Math.max(firstLimit,maxLimit["married"])

                    marriedcapitalGainsTaxBrackets.push(taxBracket)
                }
            }
        }else{
            const singleTaxBracket : CapitalGainsTaxBracketType = {
                rate : Number(taxRate)/100,
                lowerThreshold: maxLimit["single"],
                upperThreshold : Infinity
            }
            const marriedTaxBracket : CapitalGainsTaxBracketType = {
                rate : Number(taxRate)/100,
                lowerThreshold: maxLimit["married"],
                upperThreshold : Infinity
            }
            singleCapitalGainsTaxBrackets.push(singleTaxBracket)
            marriedcapitalGainsTaxBrackets.push(marriedTaxBracket)

        }

    }

    return [singleCapitalGainsTaxBrackets,marriedcapitalGainsTaxBrackets]
}

async function getTaxYear() {
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto(federalIncomeTaxRatesWebsite);

    const taxYear = await page.getByRole("heading",{name: "tax rates for a single taxpayer"})
    .textContent()
    .then(
        (taxYearHeading) => taxYearHeading != null ? Number(yearRegex.exec(taxYearHeading)) : 0
    )

    return taxYear
}


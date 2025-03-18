"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.federalIncomeTaxScraper = federalIncomeTaxScraper;
const playwright_1 = require("playwright");
const taxes_js_1 = require("../db/taxes.js");
const mongoose_1 = __importDefault(require("mongoose"));
const process_1 = require("process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT;
const databaseName = process.env.DATABASE_NAME;
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName;
const federalIncomeTaxRatesWebsite = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
const federalStandardDeductionWebsite = "https://www.irs.gov/publications/p17";
const federalCapitalGainsTaxRateWebsite = "https://www.irs.gov/taxtopics/tc409";
function federalIncomeTaxScraper() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(databaseConnectionString);
        const browser = yield playwright_1.firefox.launch({ headless: true });
        const context = yield browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        });
        const page = yield context.newPage();
        yield page.goto(federalIncomeTaxRatesWebsite);
        const taxTables = yield page.getByRole("table", { includeHidden: true }).all();
        const singleFilingIncomeTaxTable = yield taxTables[0].getByRole("rowgroup").all().then((incomeTaxTable) => __awaiter(this, void 0, void 0, function* () { return yield incomeTaxTable[1].getByRole("row").all(); }));
        const marriedFilingIncomeTaxTable = yield taxTables[0].getByRole("rowgroup").all().then((incomeTaxTable) => __awaiter(this, void 0, void 0, function* () { return yield incomeTaxTable[1].getByRole("row").all(); }));
        const yearRegex = /\d{4}/g;
        const taxYear = yield page.getByRole("heading", { name: "tax rates for a single taxpayer" })
            .textContent()
            .then((taxYearHeading) => taxYearHeading != null ? Number(yearRegex.exec(taxYearHeading)) : 0);
        let newFederalTaxBrackets = new taxes_js_1.taxModel({ year: taxYear, taxType: "federal" });
        //For single filed income taxes
        for (const row of singleFilingIncomeTaxTable) {
            const cells = yield row.getByRole("cell").all();
            let taxRate;
            let lowerThreshold;
            let upperThreshold;
            [taxRate, lowerThreshold, upperThreshold] = yield Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()]);
            let USDFormattingRegex = /[$,]/g;
            let taxBracket = {
                rate: Number(taxRate.replace('%', '')) / 100,
                lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex, '')),
                upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ? Infinity : Number(upperThreshold.replace(USDFormattingRegex, ''))
            };
            newFederalTaxBrackets.singleIncomeTaxBrackets.push(taxBracket);
        }
        //For jointly filed income taxes
        for (const row of marriedFilingIncomeTaxTable) {
            const cells = yield row.getByRole("cell").all();
            let taxRate;
            let lowerThreshold;
            let upperThreshold;
            [taxRate, lowerThreshold, upperThreshold] = yield Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()]);
            let USDFormattingRegex = /[$,]/g;
            let taxBracket = {
                rate: Number(taxRate.replace('%', '')) / 100,
                lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex, '')),
                upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ? Infinity : Number(upperThreshold.replace(USDFormattingRegex, ''))
            };
            newFederalTaxBrackets.marriedIncomeTaxBrackets.push(taxBracket);
        }
        yield page.goto(federalStandardDeductionWebsite);
        const standardDeductionTable = yield page
            .getByRole("table", { includeHidden: true, name: "Table 10-1.Standard Deduction Chart for Most People*" })
            .getByRole("row").all();
        for (const row of standardDeductionTable) {
            const cells = yield row.getByRole("cell").all();
            console.log(yield cells[0].innerHTML());
            let USDFormattingRegex = /[$,]/g;
            let deductionType;
            let deduction;
            deductionType = yield cells[0].innerHTML();
            if (deductionType == "Single or Married filing separately") {
                deduction = yield cells[1].innerHTML();
                newFederalTaxBrackets.singleStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''));
            }
            else if (deductionType == "Married filing jointly or Qualifying surviving spouse") {
                deduction = yield cells[1].innerHTML();
                newFederalTaxBrackets.marriedStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''));
            }
        }
        const hasDollarValueRegex = /\$\d*,\d*/g;
        const taxRateElement = 0;
        const bracketIncomeElement = 1;
        const possibleTaxRateStringRegex = /capital gains rate of\xa0\d*%/g;
        const taxRateRegex = /(\d*%)/g;
        yield page.goto(federalCapitalGainsTaxRateWebsite);
        const mainBody = yield page.getByRole("article");
        const [possibleRates, possibleIncomes] = yield Promise.all([mainBody.getByRole("paragraph").filter({ hasText: "capital gains rate of" }).all(),
            mainBody.getByRole("list").filter({ hasText: hasDollarValueRegex }).all()
        ]);
        const possibleIncomeAndRates = possibleRates.map((k, i) => [k, (possibleIncomes === null || possibleIncomes === void 0 ? void 0 : possibleIncomes.at(i)) != null ? possibleIncomes[i] : null]);
        let maxLimit = { "single": 0, "married": 0 };
        for (const bracket of possibleIncomeAndRates) {
            let taxRate = yield bracket[taxRateElement].textContent().then((paragraph) => { var _a, _b, _c; return ((_c = (_b = (_a = paragraph === null || paragraph === void 0 ? void 0 : paragraph.match(possibleTaxRateStringRegex)) === null || _a === void 0 ? void 0 : _a[0].match(taxRateRegex)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.replace('%', '')) || null; });
            if (bracket[bracketIncomeElement] != null) {
                const income = bracket[bracketIncomeElement];
                let singleFiling = income.getByRole("listitem").filter({ hasText: "single" }).textContent().then(textOfElement => (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []);
                let marriedFiling = income.getByRole("listitem").filter({ hasText: "married filing jointly" }).textContent().then(textOfElement => (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []);
                const [singlesBracket, marriedBracket] = yield Promise.all([singleFiling,
                    marriedFiling
                ]);
                let USDFormattingRegex = /[$,]/g;
                if ((singlesBracket === null || singlesBracket === void 0 ? void 0 : singlesBracket.length) == 1) {
                    let singleLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                    let taxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: 0,
                        upperThreshold: singleLimit
                    };
                    console.log(taxBracket);
                    newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                }
                else {
                    let firstLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                    let secondLimit = Number(singlesBracket[1].replace(USDFormattingRegex, ''));
                    if (firstLimit < secondLimit) {
                        let taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: firstLimit,
                            upperThreshold: secondLimit
                        };
                        maxLimit["single"] = Math.max(secondLimit, maxLimit["single"]);
                        console.log(taxBracket);
                        newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        let taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: secondLimit,
                            upperThreshold: firstLimit
                        };
                        maxLimit["single"] = Math.max(firstLimit, maxLimit["single"]);
                        console.log(taxBracket);
                        newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                    }
                }
                if ((marriedBracket === null || marriedBracket === void 0 ? void 0 : marriedBracket.length) == 1) {
                    let singleLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                    let taxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: 0,
                        upperThreshold: singleLimit
                    };
                    newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                }
                else {
                    let firstLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                    let secondLimit = Number(marriedBracket[1].replace(USDFormattingRegex, ''));
                    if (firstLimit < secondLimit) {
                        let taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: firstLimit,
                            upperThreshold: secondLimit
                        };
                        maxLimit["married"] = Math.max(secondLimit, maxLimit["married"]);
                        console.log(taxBracket);
                        newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        let taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: secondLimit,
                            upperThreshold: firstLimit
                        };
                        maxLimit["married"] = Math.max(firstLimit, maxLimit["married"]);
                        console.log(taxBracket);
                        newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                    }
                }
            }
            else {
                let singleTaxBracket = {
                    rate: Number(taxRate) / 100,
                    lowerThreshold: maxLimit["single"],
                    upperThreshold: Infinity
                };
                let marriedTaxBracket = {
                    rate: Number(taxRate) / 100,
                    lowerThreshold: maxLimit["married"],
                    upperThreshold: Infinity
                };
                newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(singleTaxBracket);
                newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(marriedTaxBracket);
            }
        }
        yield newFederalTaxBrackets.save();
        yield browser.close();
        (0, process_1.exit)();
    });
}
;
function federalIncomeTax() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function federalStandardDeductions() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function capitalGainsTax() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
federalIncomeTaxScraper();
//# sourceMappingURL=taxScraper.js.map
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
exports.federalTaxScraper = federalTaxScraper;
const playwright_1 = require("playwright");
const taxes_js_1 = require("../db/taxes.js");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT;
const databaseName = process.env.DATABASE_NAME;
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName;
const federalIncomeTaxRatesWebsite = process.env.FEDERAL_INCOME_TAX_RATES_WEBSITE || "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
const federalStandardDeductionWebsite = process.env.FEDERAL_STANDARD_DEDUCTION_WEBSITE || "https://www.irs.gov/publications/p17";
const federalCapitalGainsTaxRateWebsite = process.env.FEDERAL_CAPITAL_GAINS_TAX_RATE_WEBSITE || "https://www.irs.gov/taxtopics/tc409";
function federalTaxScraper() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield mongoose_1.default.connect(databaseConnectionString);
        const browser = yield playwright_1.firefox.launch({ headless: true });
        const context = yield browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        });
        const page = yield context.newPage();
        yield page.goto(federalIncomeTaxRatesWebsite);
        const USDFormattingRegex = /[$,]/g;
        const taxTables = yield page.getByRole("table", { includeHidden: true }).all();
        const singleFilingIncomeTaxTable = yield taxTables[0].getByRole("rowgroup").all().then((incomeTaxTable) => __awaiter(this, void 0, void 0, function* () { return yield incomeTaxTable[1].getByRole("row").all(); }));
        const marriedFilingIncomeTaxTable = yield taxTables[0].getByRole("rowgroup").all().then((incomeTaxTable) => __awaiter(this, void 0, void 0, function* () { return yield incomeTaxTable[1].getByRole("row").all(); }));
        const yearRegex = /\d{4}/g;
        const taxYear = yield page.getByRole("heading", { name: "tax rates for a single taxpayer" })
            .textContent()
            .then((taxYearHeading) => taxYearHeading != null ? Number(yearRegex.exec(taxYearHeading)) : 0);
        const newFederalTaxBrackets = new taxes_js_1.federalTaxModel({ year: taxYear });
        //For single filed income taxes
        for (const row of singleFilingIncomeTaxTable) {
            const cells = yield row.getByRole("cell").all();
            const [taxRate, lowerThreshold, upperThreshold] = yield Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()]);
            const taxBracket = {
                rate: Number(taxRate.replace('%', '')) / 100,
                lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex, '')),
                upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ? Infinity : Number(upperThreshold.replace(USDFormattingRegex, ''))
            };
            newFederalTaxBrackets.singleIncomeTaxBrackets.push(taxBracket);
        }
        //For jointly filed income taxes
        for (const row of marriedFilingIncomeTaxTable) {
            const cells = yield row.getByRole("cell").all();
            const [taxRate, lowerThreshold, upperThreshold] = yield Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()]);
            const taxBracket = {
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
            let deduction;
            const deductionType = yield cells[0].innerHTML();
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
        const maxLimit = { "single": 0, "married": 0 };
        for (const bracket of possibleIncomeAndRates) {
            const taxRate = yield ((_a = bracket[taxRateElement]) === null || _a === void 0 ? void 0 : _a.textContent().then((paragraph) => { var _a, _b, _c; return ((_c = (_b = (_a = paragraph === null || paragraph === void 0 ? void 0 : paragraph.match(possibleTaxRateStringRegex)) === null || _a === void 0 ? void 0 : _a[0].match(taxRateRegex)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.replace('%', '')) || null; }));
            if (bracket[bracketIncomeElement] != null) {
                const income = bracket[bracketIncomeElement];
                const singleFiling = income.getByRole("listitem").filter({ hasText: "single" }).textContent().then(textOfElement => (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []);
                const marriedFiling = income.getByRole("listitem").filter({ hasText: "married filing jointly" }).textContent().then(textOfElement => (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []);
                const [singlesBracket, marriedBracket] = yield Promise.all([singleFiling,
                    marriedFiling
                ]);
                if ((singlesBracket === null || singlesBracket === void 0 ? void 0 : singlesBracket.length) == 1) {
                    const singleLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                    const taxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: 0,
                        upperThreshold: singleLimit
                    };
                    newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                }
                else {
                    const firstLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                    const secondLimit = Number(singlesBracket[1].replace(USDFormattingRegex, ''));
                    if (firstLimit < secondLimit) {
                        const taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: firstLimit,
                            upperThreshold: secondLimit
                        };
                        maxLimit["single"] = Math.max(secondLimit, maxLimit["single"]);
                        newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        const taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: secondLimit,
                            upperThreshold: firstLimit
                        };
                        maxLimit["single"] = Math.max(firstLimit, maxLimit["single"]);
                        newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                    }
                }
                if ((marriedBracket === null || marriedBracket === void 0 ? void 0 : marriedBracket.length) == 1) {
                    const singleLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                    const taxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: 0,
                        upperThreshold: singleLimit
                    };
                    newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                }
                else {
                    const firstLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                    const secondLimit = Number(marriedBracket[1].replace(USDFormattingRegex, ''));
                    if (firstLimit < secondLimit) {
                        const taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: firstLimit,
                            upperThreshold: secondLimit
                        };
                        maxLimit["married"] = Math.max(secondLimit, maxLimit["married"]);
                        newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        const taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: secondLimit,
                            upperThreshold: firstLimit
                        };
                        maxLimit["married"] = Math.max(firstLimit, maxLimit["married"]);
                        newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                    }
                }
            }
            else {
                const singleTaxBracket = {
                    rate: Number(taxRate) / 100,
                    lowerThreshold: maxLimit["single"],
                    upperThreshold: Infinity
                };
                const marriedTaxBracket = {
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
        console.log("scraper done!");
    });
}
;
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function federalIncomeTax() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function federalStandardDeductions() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function capitalGainsTax() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
//# sourceMappingURL=taxScraper.js.map
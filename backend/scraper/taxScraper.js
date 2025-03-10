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
const taxes_js_1 = require("./db/taxes.js");
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
            let USDFormatting = /[$,]/g;
            let taxBracket = {
                rate: Number(taxRate.replace('%', '')),
                lowerThreshold: Number(lowerThreshold.replace(USDFormatting, '')),
                upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormatting, ''))) ? 999999 : Number(upperThreshold.replace(USDFormatting, ''))
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
            let USDFormatting = /[$,]/g;
            let taxBracket = {
                rate: Number(taxRate.replace('%', '')),
                lowerThreshold: Number(lowerThreshold.replace(USDFormatting, '')),
                upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormatting, ''))) ? 999999 : Number(upperThreshold.replace(USDFormatting, ''))
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
            let USDFormatting = /[$,]/g;
            let deductionType;
            let deduction;
            deductionType = yield cells[0].innerHTML();
            if (deductionType == "Single or Married filing separately") {
                deduction = yield cells[1].innerHTML();
                newFederalTaxBrackets.singleDeduction = Number(deduction.replace(USDFormatting, ''));
            }
            else if (deductionType == "Married filing jointly or Qualifying surviving spouse") {
                deduction = yield cells[1].innerHTML();
                newFederalTaxBrackets.marriedDeduction = Number(deduction.replace(USDFormatting, ''));
            }
        }
        yield newFederalTaxBrackets.save();
        yield browser.close();
        (0, process_1.exit)();
    });
}
;
federalIncomeTaxScraper();
//# sourceMappingURL=taxScraper.js.map
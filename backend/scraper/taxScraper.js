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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.federalTaxScraper = federalTaxScraper;
var playwright_1 = require("playwright");
var taxes_js_1 = require("../db/taxes.js");
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var databaseHost = process.env.DATABASE_HOST;
var databasePort = process.env.DATABASE_PORT;
var databaseName = process.env.DATABASE_NAME;
var databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName;
var federalIncomeTaxRatesWebsite = process.env.FEDERAL_INCOME_TAX_RATES_WEBSITE || "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
var federalStandardDeductionWebsite = process.env.FEDERAL_STANDARD_DEDUCTION_WEBSITE || "https://www.irs.gov/publications/p17";
var federalCapitalGainsTaxRateWebsite = process.env.FEDERAL_CAPITAL_GAINS_TAX_RATE_WEBSITE || "https://www.irs.gov/taxtopics/tc409";
function federalTaxScraper() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, context, page, USDFormattingRegex, yearRegex, taxTables, singleFilingIncomeTaxTable, marriedFilingIncomeTaxTable, taxYear, newFederalTaxBrackets, _i, singleFilingIncomeTaxTable_1, row, cells, _a, taxRate, lowerThreshold, upperThreshold, taxBracket, _b, marriedFilingIncomeTaxTable_1, row, cells, _c, taxRate, lowerThreshold, upperThreshold, taxBracket, standardDeductionTable, _d, standardDeductionTable_1, row, cells, deduction, deductionType, hasDollarValueRegex, taxRateElement, bracketIncomeElement, possibleTaxRateStringRegex, taxRateRegex, mainBody, _e, possibleRates, possibleIncomes, possibleIncomeAndRates, maxLimit, _f, possibleIncomeAndRates_1, bracket, taxRate, income, singleFiling, marriedFiling, _g, singlesBracket, marriedBracket, singleLimit, taxBracket, firstLimit, secondLimit, taxBracket, taxBracket, singleLimit, taxBracket, firstLimit, secondLimit, taxBracket, taxBracket, singleTaxBracket, marriedTaxBracket;
        var _this = this;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.connect(databaseConnectionString)];
                case 1:
                    _j.sent();
                    return [4 /*yield*/, playwright_1.firefox.launch({ headless: true })];
                case 2:
                    browser = _j.sent();
                    return [4 /*yield*/, browser.newContext({
                            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                        })];
                case 3:
                    context = _j.sent();
                    return [4 /*yield*/, context.newPage()];
                case 4:
                    page = _j.sent();
                    return [4 /*yield*/, page.goto(federalIncomeTaxRatesWebsite)];
                case 5:
                    _j.sent();
                    USDFormattingRegex = /[$,]/g;
                    yearRegex = /\d{4}/g;
                    return [4 /*yield*/, page.getByRole("table", { includeHidden: true }).all()];
                case 6:
                    taxTables = _j.sent();
                    return [4 /*yield*/, taxTables[0].getByRole("rowgroup").all().then(function (incomeTaxTable) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, incomeTaxTable[1].getByRole("row").all()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                case 7:
                    singleFilingIncomeTaxTable = _j.sent();
                    return [4 /*yield*/, taxTables[0].getByRole("rowgroup").all().then(function (incomeTaxTable) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, incomeTaxTable[1].getByRole("row").all()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                case 8:
                    marriedFilingIncomeTaxTable = _j.sent();
                    return [4 /*yield*/, page.getByRole("heading", { name: "tax rates for a single taxpayer" })
                            .textContent()
                            .then(function (taxYearHeading) { return taxYearHeading != null ? Number(yearRegex.exec(taxYearHeading)) : 0; })];
                case 9:
                    taxYear = _j.sent();
                    newFederalTaxBrackets = new taxes_js_1.federalTaxModel({ year: taxYear });
                    _i = 0, singleFilingIncomeTaxTable_1 = singleFilingIncomeTaxTable;
                    _j.label = 10;
                case 10:
                    if (!(_i < singleFilingIncomeTaxTable_1.length)) return [3 /*break*/, 14];
                    row = singleFilingIncomeTaxTable_1[_i];
                    return [4 /*yield*/, row.getByRole("cell").all()];
                case 11:
                    cells = _j.sent();
                    return [4 /*yield*/, Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()])];
                case 12:
                    _a = _j.sent(), taxRate = _a[0], lowerThreshold = _a[1], upperThreshold = _a[2];
                    taxBracket = {
                        rate: Number(taxRate.replace('%', '')) / 100,
                        lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex, '')),
                        upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ? Infinity : Number(upperThreshold.replace(USDFormattingRegex, ''))
                    };
                    newFederalTaxBrackets.singleIncomeTaxBrackets.push(taxBracket);
                    _j.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 10];
                case 14:
                    _b = 0, marriedFilingIncomeTaxTable_1 = marriedFilingIncomeTaxTable;
                    _j.label = 15;
                case 15:
                    if (!(_b < marriedFilingIncomeTaxTable_1.length)) return [3 /*break*/, 19];
                    row = marriedFilingIncomeTaxTable_1[_b];
                    return [4 /*yield*/, row.getByRole("cell").all()];
                case 16:
                    cells = _j.sent();
                    return [4 /*yield*/, Promise.all([cells[0].innerHTML(), cells[1].innerHTML(), cells[2].innerHTML()])];
                case 17:
                    _c = _j.sent(), taxRate = _c[0], lowerThreshold = _c[1], upperThreshold = _c[2];
                    taxBracket = {
                        rate: Number(taxRate.replace('%', '')) / 100,
                        lowerThreshold: Number(lowerThreshold.replace(USDFormattingRegex, '')),
                        upperThreshold: Number.isNaN(Number(upperThreshold.replace(USDFormattingRegex, ''))) ? Infinity : Number(upperThreshold.replace(USDFormattingRegex, ''))
                    };
                    newFederalTaxBrackets.marriedIncomeTaxBrackets.push(taxBracket);
                    _j.label = 18;
                case 18:
                    _b++;
                    return [3 /*break*/, 15];
                case 19: return [4 /*yield*/, page.goto(federalStandardDeductionWebsite)];
                case 20:
                    _j.sent();
                    return [4 /*yield*/, page
                            .getByRole("table", { includeHidden: true, name: "Table 10-1.Standard Deduction Chart for Most People*" })
                            .getByRole("row").all()];
                case 21:
                    standardDeductionTable = _j.sent();
                    _d = 0, standardDeductionTable_1 = standardDeductionTable;
                    _j.label = 22;
                case 22:
                    if (!(_d < standardDeductionTable_1.length)) return [3 /*break*/, 29];
                    row = standardDeductionTable_1[_d];
                    return [4 /*yield*/, row.getByRole("cell").all()];
                case 23:
                    cells = _j.sent();
                    deduction = void 0;
                    return [4 /*yield*/, cells[0].innerHTML()];
                case 24:
                    deductionType = _j.sent();
                    if (!(deductionType == "Single or Married filing separately")) return [3 /*break*/, 26];
                    return [4 /*yield*/, cells[1].innerHTML()];
                case 25:
                    deduction = _j.sent();
                    newFederalTaxBrackets.singleStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''));
                    return [3 /*break*/, 28];
                case 26:
                    if (!(deductionType == "Married filing jointly or Qualifying surviving spouse")) return [3 /*break*/, 28];
                    return [4 /*yield*/, cells[1].innerHTML()];
                case 27:
                    deduction = _j.sent();
                    newFederalTaxBrackets.marriedStandardDeduction = Number(deduction.replace(USDFormattingRegex, ''));
                    _j.label = 28;
                case 28:
                    _d++;
                    return [3 /*break*/, 22];
                case 29:
                    hasDollarValueRegex = /\$\d*(?:,\d*)*/g ///\$\d*,\d*/g
                    ;
                    taxRateElement = 0;
                    bracketIncomeElement = 1;
                    possibleTaxRateStringRegex = /capital gains rate of\xa0\d*%/g;
                    taxRateRegex = /(\d*%)/g;
                    return [4 /*yield*/, page.goto(federalCapitalGainsTaxRateWebsite)];
                case 30:
                    _j.sent();
                    return [4 /*yield*/, page.getByRole("article")];
                case 31:
                    mainBody = _j.sent();
                    return [4 /*yield*/, Promise.all([mainBody.getByRole("paragraph").filter({ hasText: "capital gains rate of" }).all(),
                            mainBody.getByRole("list").filter({ hasText: hasDollarValueRegex }).all()
                        ])];
                case 32:
                    _e = _j.sent(), possibleRates = _e[0], possibleIncomes = _e[1];
                    possibleIncomeAndRates = possibleRates.map(function (k, i) { return [k, (possibleIncomes === null || possibleIncomes === void 0 ? void 0 : possibleIncomes.at(i)) != null ? possibleIncomes[i] : null]; });
                    maxLimit = { "single": 0, "married": 0 };
                    _f = 0, possibleIncomeAndRates_1 = possibleIncomeAndRates;
                    _j.label = 33;
                case 33:
                    if (!(_f < possibleIncomeAndRates_1.length)) return [3 /*break*/, 38];
                    bracket = possibleIncomeAndRates_1[_f];
                    return [4 /*yield*/, ((_h = bracket[taxRateElement]) === null || _h === void 0 ? void 0 : _h.textContent().then(function (paragraph) { var _a, _b, _c; return ((_c = (_b = (_a = paragraph === null || paragraph === void 0 ? void 0 : paragraph.match(possibleTaxRateStringRegex)) === null || _a === void 0 ? void 0 : _a[0].match(taxRateRegex)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.replace('%', '')) || null; }))];
                case 34:
                    taxRate = _j.sent();
                    if (!(bracket[bracketIncomeElement] != null)) return [3 /*break*/, 36];
                    income = bracket[bracketIncomeElement];
                    singleFiling = income.getByRole("listitem").filter({ hasText: "single" }).textContent().then(function (textOfElement) { return (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []; });
                    marriedFiling = income.getByRole("listitem").filter({ hasText: "married filing jointly" }).textContent().then(function (textOfElement) { return (textOfElement === null || textOfElement === void 0 ? void 0 : textOfElement.match(hasDollarValueRegex)) || []; });
                    return [4 /*yield*/, Promise.all([singleFiling,
                            marriedFiling
                        ])];
                case 35:
                    _g = _j.sent(), singlesBracket = _g[0], marriedBracket = _g[1];
                    if ((singlesBracket === null || singlesBracket === void 0 ? void 0 : singlesBracket.length) == 1) {
                        singleLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                        taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: 0,
                            upperThreshold: singleLimit
                        };
                        newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        firstLimit = Number(singlesBracket[0].replace(USDFormattingRegex, ''));
                        secondLimit = Number(singlesBracket[1].replace(USDFormattingRegex, ''));
                        if (firstLimit < secondLimit) {
                            taxBracket = {
                                rate: Number(taxRate) / 100,
                                lowerThreshold: firstLimit,
                                upperThreshold: secondLimit
                            };
                            maxLimit["single"] = Math.max(secondLimit, maxLimit["single"]);
                            newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                        }
                        else {
                            taxBracket = {
                                rate: Number(taxRate) / 100,
                                lowerThreshold: secondLimit,
                                upperThreshold: firstLimit
                            };
                            maxLimit["single"] = Math.max(firstLimit, maxLimit["single"]);
                            newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(taxBracket);
                        }
                    }
                    if ((marriedBracket === null || marriedBracket === void 0 ? void 0 : marriedBracket.length) == 1) {
                        singleLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                        taxBracket = {
                            rate: Number(taxRate) / 100,
                            lowerThreshold: 0,
                            upperThreshold: singleLimit
                        };
                        newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                    }
                    else {
                        firstLimit = Number(marriedBracket[0].replace(USDFormattingRegex, ''));
                        secondLimit = Number(marriedBracket[1].replace(USDFormattingRegex, ''));
                        if (firstLimit < secondLimit) {
                            taxBracket = {
                                rate: Number(taxRate) / 100,
                                lowerThreshold: firstLimit,
                                upperThreshold: secondLimit
                            };
                            maxLimit["married"] = Math.max(secondLimit, maxLimit["married"]);
                            newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                        }
                        else {
                            taxBracket = {
                                rate: Number(taxRate) / 100,
                                lowerThreshold: secondLimit,
                                upperThreshold: firstLimit
                            };
                            maxLimit["married"] = Math.max(firstLimit, maxLimit["married"]);
                            newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(taxBracket);
                        }
                    }
                    return [3 /*break*/, 37];
                case 36:
                    singleTaxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: maxLimit["single"],
                        upperThreshold: Infinity
                    };
                    marriedTaxBracket = {
                        rate: Number(taxRate) / 100,
                        lowerThreshold: maxLimit["married"],
                        upperThreshold: Infinity
                    };
                    newFederalTaxBrackets.singleCapitalGainsTaxBrackets.push(singleTaxBracket);
                    newFederalTaxBrackets.marriedcapitalGainsTaxBrackets.push(marriedTaxBracket);
                    _j.label = 37;
                case 37:
                    _f++;
                    return [3 /*break*/, 33];
                case 38: return [4 /*yield*/, newFederalTaxBrackets.save()];
                case 39:
                    _j.sent();
                    return [4 /*yield*/, browser.close()];
                case 40:
                    _j.sent();
                    console.log("scraper done!");
                    return [2 /*return*/];
            }
        });
    });
}
;
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function federalIncomeTax() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function federalStandardDeductions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function capitalGainsTax() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}

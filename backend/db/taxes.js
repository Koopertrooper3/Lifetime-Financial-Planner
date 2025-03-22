"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federalTaxModel = exports.federalTaxSchema = exports.taxBracketSchema = void 0;
var mongoose_1 = require("mongoose");
exports.taxBracketSchema = new mongoose_1.Schema({
    rate: Number,
    lowerThreshold: Number,
    upperThreshold: Number
});
exports.federalTaxSchema = new mongoose_1.Schema({
    year: {
        type: Number,
        unique: true
    },
    singleIncomeTaxBrackets: [exports.taxBracketSchema],
    marriedIncomeTaxBrackets: [exports.taxBracketSchema],
    singleStandardDeduction: Number,
    marriedStandardDeduction: Number,
    singleCapitalGainsTaxBrackets: [exports.taxBracketSchema],
    marriedcapitalGainsTaxBrackets: [exports.taxBracketSchema]
});
exports.federalTaxModel = (0, mongoose_1.model)('taxModel', exports.federalTaxSchema);

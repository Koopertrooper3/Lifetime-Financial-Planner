"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxModel = exports.taxSchema = exports.taxBracketSchema = void 0;
const mongoose_1 = require("mongoose");
exports.taxBracketSchema = new mongoose_1.Schema({
    rate: Number,
    lowerThreshold: Number,
    upperThreshold: Number
});
exports.taxSchema = new mongoose_1.Schema({
    year: {
        type: Number,
        index: true
    },
    taxType: String,
    singleIncomeTaxBrackets: [exports.taxBracketSchema],
    marriedIncomeTaxBrackets: [exports.taxBracketSchema],
    singleStandardDeduction: Number,
    marriedStandardDeduction: Number,
    singleCapitalGainsTaxBrackets: [exports.taxBracketSchema],
    marriedcapitalGainsTaxBrackets: [exports.taxBracketSchema]
});
exports.taxModel = (0, mongoose_1.model)('taxModel', exports.taxSchema);
//# sourceMappingURL=taxes.js.map
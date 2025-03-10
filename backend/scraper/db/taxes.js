"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxModel = exports.taxBracketSchema = void 0;
const mongoose_1 = require("mongoose");
// export interface taxType {
//     taxType : String,
//     brackets : [taxBracket]
// }
exports.taxBracketSchema = new mongoose_1.Schema({
    rate: Number,
    lowerThreshold: Number,
    upperThreshold: Number
});
const taxSchema = new mongoose_1.Schema({
    year: {
        type: Number,
        index: true
    },
    taxType: String,
    singleIncomeTaxBrackets: [exports.taxBracketSchema],
    marriedIncomeTaxBrackets: [exports.taxBracketSchema],
    singleDeduction: Number,
    marriedDeduction: Number
});
exports.taxModel = (0, mongoose_1.model)('taxModel', taxSchema);
//# sourceMappingURL=taxes.js.map
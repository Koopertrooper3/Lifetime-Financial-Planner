import { Schema, model, connect } from 'mongoose';

export interface taxBracketType {
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
  }
// export interface taxType {
//     taxType : String,
//     brackets : [taxBracket]
// }
export const taxBracketSchema = new Schema<taxBracketType>({
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
})

const taxSchema = new Schema({
    year: {
        type : Number,
        index : true
    },
    taxType : String,
    singleIncomeTaxBrackets : [taxBracketSchema],
    marriedIncomeTaxBrackets : [taxBracketSchema],
    singleStandardDeduction : Number,
    marriedStandardDeduction: Number
})

export let taxModel = model('taxModel',taxSchema);

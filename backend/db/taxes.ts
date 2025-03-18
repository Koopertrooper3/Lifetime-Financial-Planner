import { Schema, model, connect } from 'mongoose';

export interface taxBracketType {
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
  }
export interface taxType {
    year: Number
    taxType : String,
    singleIncomeTaxBrackets : [taxBracketType],
    marriedIncomeTaxBrackets : [taxBracketType],
    singleStandardDeduction : Number,
    marriedStandardDeduction: Number,
    singleCapitalGainsTaxBrackets : [taxBracketType],
    marriedcapitalGainsTaxBrackets : [taxBracketType]
}
export const taxBracketSchema = new Schema<taxBracketType>({
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
})

export const taxSchema = new Schema<taxType>({
    year: {
        type : Number,
        index : true
    },
    taxType : String,
    singleIncomeTaxBrackets : [taxBracketSchema],
    marriedIncomeTaxBrackets : [taxBracketSchema],
    singleStandardDeduction : Number,
    marriedStandardDeduction: Number,
    singleCapitalGainsTaxBrackets : [taxBracketSchema],
    marriedcapitalGainsTaxBrackets : [taxBracketSchema]
})

export let taxModel = model('taxModel',taxSchema);

import { Schema, model } from 'mongoose';

export interface taxBracketType {
    rate : number,
    lowerThreshold : number,
    upperThreshold : number
  }
export interface taxType {
    year: number
    taxType : string,
    singleIncomeTaxBrackets : [taxBracketType],
    marriedIncomeTaxBrackets : [taxBracketType],
    singleStandardDeduction : number,
    marriedStandardDeduction: number,
    singleCapitalGainsTaxBrackets : [taxBracketType],
    marriedcapitalGainsTaxBrackets : [taxBracketType]
}
export const taxBracketSchema = new Schema<taxBracketType>({
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
})

export const federalTaxSchema = new Schema<taxType>({
    year: {
        type : Number,
        unique: true
    },
    singleIncomeTaxBrackets : [taxBracketSchema],
    marriedIncomeTaxBrackets : [taxBracketSchema],
    singleStandardDeduction : Number,
    marriedStandardDeduction: Number,
    singleCapitalGainsTaxBrackets : [taxBracketSchema],
    marriedcapitalGainsTaxBrackets : [taxBracketSchema]
})

export const federalTaxModel = model('taxModel',federalTaxSchema);

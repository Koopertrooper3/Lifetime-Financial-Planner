import { Schema, model } from 'mongoose';

export interface taxBracketType {
    rate : number,
    lowerThreshold : number,
}
export interface StateTaxBracket{
    rate: number,
    lowerThreshold: number,
    flatAdjustment:number
}
export interface StateTax{
    year: number,
    singleIncomeTax: StateTaxBracket[],
    marriedIncomeTax: StateTaxBracket[]
}
export interface FederalTax {
    year: number
    singleIncomeTaxBrackets : taxBracketType[],
    marriedIncomeTaxBrackets : taxBracketType[],
    singleStandardDeduction : number,
    marriedStandardDeduction: number,
    singleCapitalGainsTaxBrackets : taxBracketType[],
    marriedcapitalGainsTaxBrackets : taxBracketType[]
}


export const taxBracketSchema = new Schema<taxBracketType>({
    rate : Number,
    lowerThreshold : Number,
})

export const federalTaxSchema = new Schema<FederalTax>({
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

export const stateTaxBracketSchema = new Schema<StateTaxBracket>({
    rate: Number,
    lowerThreshold: Number,
    flatAdjustment: Number
})

export const stateTaxSchema = new Schema<StateTax>({
    year: Number,
    singleIncomeTax: [stateTaxBracketSchema],
    marriedIncomeTax: [stateTaxBracketSchema]
})

export const federalTaxModel = model('taxModel',federalTaxSchema);

import { Schema, model } from 'mongoose';

export interface taxBracketType {
    rate : number,
    upperThreshold : number
}
export interface CapitalGainsTaxBracketType {
    rate : number,
    lowerThreshold : number,
    upperThreshold : number
}
export interface StateTaxBracket{
    rate: number,
    upperThreshold: number,
    flatAdjustment:number
}
export interface StateTax{
    state: string,
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
    upperThreshold : Number
})

export const capitalGainsTaxBracketSchema = new Schema<CapitalGainsTaxBracketType>({
    rate : Number,
    lowerThreshold : Number,
    upperThreshold : Number
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
    singleCapitalGainsTaxBrackets : [capitalGainsTaxBracketSchema],
    marriedcapitalGainsTaxBrackets : [capitalGainsTaxBracketSchema]
})

export const stateTaxBracketSchema = new Schema<StateTaxBracket>({
    rate: Number,
    upperThreshold: Number,
    flatAdjustment: Number
})

export const stateTaxSchema = new Schema<StateTax>({
    state: String,
    year: Number,
    singleIncomeTax: [stateTaxBracketSchema],
    marriedIncomeTax: [stateTaxBracketSchema]
})

export const federalTaxModel = model('taxModel',federalTaxSchema);

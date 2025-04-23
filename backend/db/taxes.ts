import { Schema, model } from 'mongoose';

export interface taxBracketType {
    rate : number,
    lowerThreshold : number,
    upperThreshold : number
}
export interface stateTaxBracket{
    rate: number,
    lower_threshold: number,
    upper_threshold: number,
    flat_adjustment:number
}
export interface StateTax{
    state: string,
    year: number,
    single_income_tax: stateTaxBracket[],
    married_income_tax: stateTaxBracket[]
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
    singleCapitalGainsTaxBrackets : [taxBracketSchema],
    marriedcapitalGainsTaxBrackets : [taxBracketSchema]
})

export const stateTaxBracketSchema = new Schema<stateTaxBracket>({
    rate: Number,
    lower_threshold: Number,
    upper_threshold: Number,
    flat_adjustment: Number
})

export const stateTaxSchema = new Schema<StateTax>({
    state: String,
    year: Number,
    single_income_tax: [stateTaxBracketSchema],
    married_income_tax: [stateTaxBracketSchema]
})

export const federalTaxModel = model('taxModel',federalTaxSchema);

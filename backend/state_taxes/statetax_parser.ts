import { parse } from 'yaml'
import path from 'path'
import { readFileSync } from 'fs'

const stateTaxFile = path.resolve(__dirname,"..","..","state_taxes","statetaxes.yaml")

export function stateTaxParser(){
    console.log(stateTaxFile)
    const file = readFileSync(stateTaxFile, 'utf8')
    const parsedTaxes : StateTaxBracket[] = parse(file)
    return parsedTaxes
}

interface TaxBracket{
    rate: number
    lower_threshold: number
    upper_threshold: number
    flat_adjustment:number
}
export interface StateTaxBracket{
    state: string,
    year: number,
    single_income_tax: TaxBracket[]
    married_income_tax: TaxBracket[]
}
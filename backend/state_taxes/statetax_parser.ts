import { parse } from 'yaml'
import path from 'path'
import { readFileSync } from 'fs'
import { StateTax, StateTaxBracket } from '../db/taxes'
const stateTaxFile = path.resolve(__dirname,"..","..","state_taxes","statetaxes.yaml")

export function stateTaxParser(){
    console.log(stateTaxFile)
    const file = readFileSync(stateTaxFile, 'utf8')
    const parsedTaxes = parse(file)
    const wellFormedTaxes : Record<string,StateTax> = {}
    Object.entries(parsedTaxes).forEach((value)=>{
        wellFormedTaxes[value[0]] = {
            state : value[0],
            year: (value[1] as YAMLInterface).year,
            singleIncomeTax: (value[1] as YAMLInterface).singleIncomeTax,
            marriedIncomeTax: (value[1] as YAMLInterface).marriedIncomeTax
        }
    })
    return parsedTaxes
}

interface YAMLInterface{
    year: number,
    singleIncomeTax: StateTaxBracket[],
    marriedIncomeTax: StateTaxBracket[]
}
import { Investment } from "../db/InvestmentSchema"
import { WriteStream,createWriteStream } from "fs"
import path from "path"
import { finished } from "stream/promises"

export function initalizeCSVLog(name: string,dateTimeString : string){

    const csvWriteStream = createWriteStream(path.resolve(__dirname, '..','..','logs',`${name}_${dateTimeString}.csv`), {flags: 'a'})

    csvWriteStream.write("year,investments+\n")
    return csvWriteStream
}
export function writeCSVlog(accounts : Record<string,Investment>, writeStream : WriteStream,year : number){

    const accountLogMessages : string[] = []
    Object.values(accounts).forEach((account) =>{
        accountLogMessages.push(`${account.id} value: ${account.value}`)
    })
    writeStream.write(`${year},`+accountLogMessages.join(",")+"\n")
}

export async function closeCSVlog(writeStream : WriteStream){
    writeStream.end()
    await finished(writeStream)
}

//.log file logging functions

export function incomeEventLogMessage(year : number, eventName: string, amount : number){
    return `[Income] Year: ${year}, Amount: ${amount}, Event name: ${eventName}\n`
}
export function RMDLogMessage(year: number, amount : number, investmentType : string){
    return `[RMD] Year: ${year}, Amount: ${amount}, Investment Type: ${investmentType}\n`
}
export function ExpenseLogMessage(year: number, amount : number, expense : string){
    return `[Expense]: Year: ${year}, Amount: ${amount}, Expense: ${expense}\n`
}
export function RothConversionLogMessage(year: number, amount : number, investmentType : string){
    return `[Roth Conversion]: Year: ${year}, Amount ${amount}, Investment Type: ${investmentType}\n`
}

export function pushToLog(logStream : WriteStream, message : string){
    logStream.write(message)
}
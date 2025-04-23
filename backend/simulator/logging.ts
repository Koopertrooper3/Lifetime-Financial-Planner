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
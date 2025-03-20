import mongoose from "mongoose"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { workerData } from "worker_threads"
const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName

async function main(){
    await mongoose.connect(databaseConnectionString)
    const scenarioID = workerData.scenarioID

    console.log(scenarioID)
}

main()
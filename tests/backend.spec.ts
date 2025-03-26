import { test, expect } from 'playwright-test-coverage';
import { MongoClient,ObjectId } from "mongodb";
import dotenv from 'dotenv';
import path from 'path';

import {Scenario} from "../backend/db/Scenario"
dotenv.config({ path: path.resolve(__dirname, '.env') });

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort


test('simulation Request', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")

  const user = await userConnection.findOne({})
  const userScenarioID = user!.ownedScenarios[0].toString()

  const simulationRequest = await request.post(`http://127.0.0.1:8000/scenario/runsimulation`, {
    data: {"userID":user?._id.toString(),"scenarioID":userScenarioID}
  });

  let body = await simulationRequest.json()
  expect(await simulationRequest.json()).toEqual({completed : Number(process.env.TOTAL_NUMBER_OF_SIMULATIONS), succeeded: 0, failed: 0})

});

interface createScenarioResponse{
  message: string,
  scenarioID: string
}

test('Create Scenario', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")
  let user = await userConnection.findOne({})
  let originalSharedArray = user?.ownedScenarios
  let newScenario : Scenario = {
    name: "Marisa",
    maritalStatus: "individual",
    birthYear: [1985],
    lifeExpectancy: [{type: "Fixed",value: 80}],
    investmentTypes: [],
    investments: [{investmentType: "cash",value: 100,taxStatus: "non-retirement",id: "cash"}],
    eventSeries: [ {name: "salary",
      start: {
        type: "Fixed",
        value: 2025,
      },
      duration: {
        type: "Fixed",
        value: 40,
      },
      event: {
        type: "Income",
        initalAmount: 75000,
        changeAmountOrPercent: "amount",
        changeDistribution: {
          type: "Uniform",
          lower: 500,
          upper: 2000,
        },
        inflationAdjusted: false,
        userFraction: 1,
        socialSecurity: false,
      }
    } ],
    inflationAssumption: {type: "Fixed",value: 0.03},
    afterTaxContributionLimit: 10000,
    spendingStrategy: [],
    expenseWithdrawalStrategy: [],
    RMDStrategy: [],
    RothConversionOpt: false,
    RothConversionStart: 0,
    RothConversionEnd: 0,
    RothConversionStrategy: [],
    financialGoal: 10000,
    residenceState: "CT",
  }
  const simulationRequest = await request.post(`http://127.0.0.1:8000/scenario/create`, {
    data: {"userID": user?._id.toString(), "scenario" : newScenario}
  });

  let body : createScenarioResponse = await simulationRequest.json()
  user = await userConnection.findOne({_id: user?._id})
  let newScenarioID = body.scenarioID

  expect(body).toEqual(expect.objectContaining({message: "Scenario created successfully"}))
  let testValue = user?.ownedScenarios.map((x) => x.toString()).includes(newScenarioID)

  //Clean up database
  let result = await userConnection.findOneAndUpdate({_id: user?._id}, {$set: {"ownedScenarios": originalSharedArray}})
  const scenarioConnection = client.db(databaseName).collection("scenarios")
  await scenarioConnection.findOneAndDelete({_id: new ObjectId(newScenarioID)})

});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });


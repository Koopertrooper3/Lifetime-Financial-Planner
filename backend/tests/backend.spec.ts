import { test, expect } from 'playwright-test-coverage';
import { MongoClient,ObjectId } from "mongodb";
import dotenv from 'dotenv';
import path from 'path';
import { SharedScenario } from '../db/User';

import {Scenario} from "../db/Scenario"
import { numericalExploration, RothExploration } from '../simulator/simulatorInterfaces';
dotenv.config({ path: path.resolve(__dirname, '..', '..','.env') });

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort

const backendHost = process.env.BACKEND_IP
const backendPort = process.env.BACKEND_PORT

test('Single simulation Request', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")
  const totalSimulations= 1
  const user = await userConnection.findOne({})
  const userScenarioID = user?.ownedScenarios[0].toString()

  const simulationRequest = await request.post(`http://${backendHost}:${backendPort}/simulation/run-simulation`, {
    data: {"userID":user?._id.toString(),"scenarioID":userScenarioID, "totalSimulations": totalSimulations}
  });

  expect(await simulationRequest.status()).toEqual(200)

});

test('Multiple simulation Request', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")
  const totalSimulations= 10
  const user = await userConnection.findOne({})
  const userScenarioID = user?.ownedScenarios[0].toString()

  const simulationRequest = await request.post(`http://${backendHost}:${backendPort}/simulation/run-simulation`, {
    data: {"userID":user?._id.toString(),"scenarioID":userScenarioID, "totalSimulations": totalSimulations}
  });

  expect(await simulationRequest.status()).toEqual(200)

});
interface explorationBody {
  scenarioID: string,
  userID: string,
  totalSimulations: number,
  explorationParameter: RothExploration | numericalExploration
}
test('Roth Optimizer Exploration Request', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")
  const totalSimulations = 1
  const user = await userConnection.findOne({})
  const userScenarioID = user?.ownedScenarios[0].toString()
  const explorationRequestBody : explorationBody = {
    userID : user?._id.toString() || "",
    scenarioID: userScenarioID,
    totalSimulations : totalSimulations,
    explorationParameter: {
      type: "roth",
    }
  }
  const explorationRequest = await request.post(`http://${backendHost}:${backendPort}/simulation/simulation-explore`, {
    data: explorationRequestBody
  });

  expect(await explorationRequest.status()).toEqual(200)

});

interface createScenarioResponse{
  message: string,
  scenarioID: string
}

test('Create Scenario', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);

  const userConnection = client.db(databaseName).collection("users")
  let user = await userConnection.findOne({})
  
  const originalSharedArray = user?.ownedScenarios
  const newScenario : Scenario = {
    name: "Marisa",
    maritalStatus: "individual",
    birthYears: [1985],
    lifeExpectancy: [{type: "fixed", value: 80}],
    investmentTypes: { 
      "cash": {
        name: "cash",
        description: "cash",
        returnAmtOrPct: "amount",
        returnDistribution: {type: "fixed", value: 0},
        expenseRatio: 0,
        incomeAmtOrPct: "percent",
        incomeDistribution: {type: "fixed", value: 0},
        taxability: true,
      },
    },
    investments: { 
      "cash" : {
        investmentType: "cash",value: 100,taxStatus: "non-retirement",id: "cash"
      }
    },
    eventSeries: {
      "cash": {
        name: "salary",
        start: {
          type: "fixed",
          value: 2025,
        },
        duration: {
          type: "fixed",
          value: 40,
        },
        event: {
          type: "income",
          initialAmount: 75000,
          changeAmtOrPct: "amount",
          changeDistribution: {
            type: "uniform",
            lower: 500,
            upper: 2000,
          },
          inflationAdjusted: false,
          userFraction: 1,
          socialSecurity: false,
        }
      },
      "invest" : {
        name: "invest",
        start: {type: "startWith", eventSeries: "salary"},
        duration: {type: "fixed", value: 200},
        event: {
            type: "invest", 
            assetAllocation: {"S&P 500 non-retirement": 0.6,"S&P 500 after-tax" :0.4},
            glidePath: true,
            assetAllocation2: {"S&P 500 non-retirement": 0.8,"S&P 500 after-tax" :0.2},
            maxCash: 1000
        }
      }
     },
    inflationAssumption: {type: "fixed", value: 0.03},
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
  const simulationRequest = await request.post(`http://${backendHost}:${backendPort}/scenario/create`, {
    data: {"userID": user?._id.toString(), "scenario" : newScenario}
  });

  const body : createScenarioResponse = await simulationRequest.json()
  user = await userConnection.findOne({_id: user?._id})
  const newScenarioID = body.scenarioID

  expect(body).toEqual(expect.objectContaining({message: "Scenario created successfully"}))
  const testValue = user?.ownedScenarios.map((x : ObjectId) => x.toString()).includes(newScenarioID)
  expect(testValue).toBeTruthy()
  //Clean up database
  await userConnection.findOneAndUpdate({_id: user?._id}, {$set: {"ownedScenarios": originalSharedArray}})
  const scenarioConnection = client.db(databaseName).collection("scenarios")
  await scenarioConnection.findOneAndDelete({_id: new ObjectId(newScenarioID)})

});

test('Share Scenario', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const userConnection = client.db(databaseName).collection("users")
  const users = await userConnection.find({}).limit(2).toArray()
  let scenarioID;
  let owner
  let target;
  let originalSharedArray
  if(users[0] == null || users[1] == null){
    throw new Error("Need two users for this test")
  }
  if(users[0].ownedScenarios.length > users[1].ownedScenarios){
    owner = users[0]._id
    target = users[1]._id
    scenarioID = users[0].ownedScenarios[0]
    originalSharedArray = users[1].sharedScenarios
  }else{
    owner = users[1]._id
    target = users[0]._id
    scenarioID = users[1].ownedScenarios[0]
    originalSharedArray = users[1].sharedScenarios
  }

  const shareRequest = await request.post(`http://${backendHost}:${backendPort}/user/shareScenario`, {
    data: {
      "access": "read-only",
      "scenarioID" : scenarioID.toString(),
      "owner": owner.toString(),
      "shareWith": target.toString(),
  }
  });

  expect(await shareRequest.json()).toEqual({ message: "Scenario created shared!" })

  const targetUser = await userConnection.findOne({_id: target})
  const databaseResult = targetUser?.sharedScenarios.some((sharedScenarioObject : SharedScenario) =>{
    return sharedScenarioObject.scenarioID.equals(scenarioID) && sharedScenarioObject.permission == "read-only"
  })

  expect(databaseResult).toBeTruthy()
  await userConnection.findOneAndUpdate({_id: target},{$set: {"ownedScenarios": originalSharedArray}})

});
// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });


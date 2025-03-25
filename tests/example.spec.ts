import { test, expect } from 'playwright-test-coverage';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseName = process.env.DATABASE_NAME
const databaseConnectionString = databaseHost + ':' + databasePort


test('simulation Request', async ({ request }) => {
  const client = new MongoClient(databaseConnectionString);
  const scenarioCollection = client.db(databaseName).collection("scenarios")

  const scenario = await scenarioCollection.findOne({})
  const simulationRequest = await request.post(`/scenario/runsimulation`, {
    data: {"scenarioID":scenario?._id.toString()}
  });

  let body = await simulationRequest.json()
  expect(await simulationRequest.json()).toEqual({completed : 10, succeeded: 0, failed: 0})

});


// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });


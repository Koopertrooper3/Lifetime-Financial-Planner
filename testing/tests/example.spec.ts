import { test, expect } from '@playwright/test';

test('simulation Request', async ({ request }) => {
  

  const simulationRequest = await request.post(`/scenario/runsimulation`, {
    data: {"scenarioID":"67e0fa656bf0cb199f0abb05"}
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

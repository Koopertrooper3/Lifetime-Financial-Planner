import { test } from './baseFixtures';
import { expect } from 'playwright/test';



test('Life expectancy', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  await page.getByRole('link', { name: 'reimu' }).click();
  await expect(page.locator('#root')).toContainText('Fixed: 80');
  await expect(page.locator('#root')).toContainText('Normal: mean = 82, stdev = 3');
  await expect(page.locator('#root')).toContainText('Financial Goal: $10000');
  await expect(page.locator('#root')).toContainText('Residence State: NY');
  await page.getByText('Martial Status: couple').click();
  await expect(page.locator('#root')).toContainText('couple');
});


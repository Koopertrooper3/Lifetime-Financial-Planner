
import { test, expect,defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

//.env files
// Alternatively, read from "../my.env" file.
dotenv.config({ path: path.resolve(__dirname, '..', 'scrapertest.env') });

export default defineConfig({
    // Run your local dev server before starting the tests
    webServer: {
      command: 'npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  });

test('has title', async ({ page }) => {
  
});

test('get started link', async ({ page }) => {
  
});
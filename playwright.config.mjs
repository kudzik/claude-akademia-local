import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
 testDir: './test/e2e',
 fullyParallel: false,
 workers: 1,
 retries: 0,
 reporter: [['list']],
 outputDir: 'test-results',
 preserveOutput: 'always',
 use: {
  ...devices['Desktop Chrome'],
  trace: 'retain-on-failure'
 }
});

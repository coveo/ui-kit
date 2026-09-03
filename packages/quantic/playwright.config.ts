import {defineConfig, devices} from '@playwright/test';
import {loadScratchOrgEnvironment} from './playwright/scratch-org-environment';

const {lwsEnabledUrl, lwsDisabledUrl} = loadScratchOrgEnvironment(__dirname);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './force-app',
  testMatch: '*.e2e.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['list'], ['blob']] : [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-first-failure',
    // Capture screenshot after each test failure when not on CI.
    screenshot: 'on-first-failure',
    // Record video on failure when not on CI.
    video: process.env.CI ? 'off' : 'retain-on-failure',
    permissions: ['clipboard-read'],
  },

  projects: [
    {
      name: 'LWS-enabled',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: lwsEnabledUrl,
      },
    },
    {
      name: 'LWS-disabled',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: lwsDisabledUrl,
      },
    },
  ],
});

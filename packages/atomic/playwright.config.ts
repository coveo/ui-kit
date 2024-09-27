import {defineConfig, devices} from '@playwright/test';
import {resolve} from 'node:path';

const DEFAULT_DESKTOP_VIEWPORT = {
  width: 1920,
  height: 1080,
};

const pactDirectory = resolve(
  import.meta.dirname,
  '../headless/pact-provider/pacts'
);

export default defineConfig({
  testDir: './src',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI || false, //temp
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html'], ['list'], ['github'], ['blob']]
    : [['html'], ['list']],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: DEFAULT_DESKTOP_VIEWPORT,
      },
    },
    // {
    //   name: 'firefox',
    //   use: {...devices['Desktop Firefox'], viewport: DEFAULT_DESKTOP_VIEWPORT},
    // },
    // {
    //   name: 'webkit',
    //   use: {...devices['Desktop Safari'], viewport: DEFAULT_DESKTOP_VIEWPORT},
    // },
  ],
  expect: {
    timeout: 7 * 1000,
  },
  webServer: process.env.CI
    ? [
        {
          command: 'npx http-server ./dist-storybook -p 4400',
          port: 4400,
          timeout: 120 * 1000,
          reuseExistingServer: !process.env.CI,
        },
        {
          command: `docker run -t -p 1234:1234 -v "$${pactDirectory}" pactfoundation/pact-stub-server -p 1234 -d pacts -o`,
          port: 1234,
          timeout: 60 * 10 * 1000,
          reuseExistingServer: !process.env.CI,
        },
      ]
    : undefined,
});

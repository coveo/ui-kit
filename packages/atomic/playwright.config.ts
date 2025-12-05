import {defineConfig, devices} from '@playwright/test';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const DEFAULT_DESKTOP_VIEWPORT = {
  width: 1920,
  height: 1080,
};

export default defineConfig({
  testDir: './src',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}{ext}',
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html'], ['list'], ['github'], ['blob']]
    : [['html'], ['list']],
  use: {
    trace: 'retain-on-failure',
    baseURL: isCDN
      ? 'http://localhost:3000/atomic/v3/storybook/'
      : 'http://localhost:4400',
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
    ? {
        command: isCDN
          ? 'pnpm exec turbo serve --filter=@coveo/cdn'
          : 'pnpm exec ws -d ./dist-storybook -p 4400',

        stdout: 'pipe',
        url: isCDN
          ? 'http://localhost:3000/atomic/v3/storybook/'
          : 'http://localhost:4400',
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
        gracefulShutdown: {signal: 'SIGTERM', timeout: 500},
      }
    : undefined,
});

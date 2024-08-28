import {defineConfig, devices} from '@playwright/test';

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
    ? {
        command: 'npx http-server ./dist-storybook -p 4400',
        port: 4400,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});

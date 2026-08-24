import {defineConfig, devices} from '@playwright/test';

const DEFAULT_VITE_PORT = 3350;
const vitePort = process.env.VITE_PORT
  ? Number.parseInt(process.env.VITE_PORT, 10)
  : DEFAULT_VITE_PORT;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${vitePort}`,
    trace: 'on-first-retry',
  },
  expect: {
    timeout: 7 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${vitePort}`,
    timeout: 10 * 60e3,
    port: vitePort,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

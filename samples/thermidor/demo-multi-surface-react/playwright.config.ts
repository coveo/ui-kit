import {defineConfig, devices} from '@playwright/test';

const MOCK_PORT = 3466;
const APP_PORT = 4175;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // The mock keeps one search view in memory for every session, so the tests run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : 'list',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: 'on-first-retry',
    viewport: {width: 1400, height: 1000},
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome'], viewport: {width: 1400, height: 1000}}},
  ],
  webServer: [
    {
      command: 'pnpm --filter @coveo/mock-converse-api start',
      env: {PORT: String(MOCK_PORT)},
      url: `http://localhost:${MOCK_PORT}/multi-surface/sessions`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: `pnpm exec vite --host 127.0.0.1 --port ${APP_PORT} --strictPort`,
      env: {VITE_COVEO_ENDPOINT: `http://localhost:${MOCK_PORT}/converse-schema`},
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});

import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    // Run the production server so tests exercise the same output users ship.
    // `NODE_OPTIONS` preloads the MSW mock server (via tsx, which resolves the
    // mock package's TypeScript sources) into the Next.js process, so the
    // server-side static-state fetch is deterministic and never hits a live API.
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_OPTIONS: '--import tsx --import ./mocks/register.ts',
    },
  },
});

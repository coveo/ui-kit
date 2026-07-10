import {defineConfig, devices} from '@playwright/test';

const MOCK_API_PORT = process.env.MOCK_API_PORT ?? '9090';
const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`;

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
  webServer: [
    {
      // Standalone Express server powered by @mswjs/http-middleware.
      // All Coveo Commerce API calls (SSR and client-side) are intercepted here
      // because the Next.js server is started with MOCK_API_URL, which the
      // headless engine uses as its proxyBaseUrl.
      command: 'node mocks/mock-server.mjs',
      url: `${MOCK_API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: {MOCK_API_PORT},
    },
    {
      // Run the production build so tests exercise the same output users ship.
      command: 'pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {NEXT_PUBLIC_MOCK_API_URL: MOCK_API_URL},
    },
  ],
});

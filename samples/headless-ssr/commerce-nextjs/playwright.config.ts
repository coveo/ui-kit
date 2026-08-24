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
    trace: 'on',
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
      command: 'node mocks/mock-server.mjs',
      url: `${MOCK_API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: {MOCK_API_PORT},
    },
    {
      // Run the production build so tests exercise the same output users ship.
      //
      // The build must happen here rather than through the package's `build`
      // task: NEXT_PUBLIC_MOCK_API_URL is inlined into the client bundle at
      // build time, and without it the hydrated page calls the live Coveo API
      // instead of the mock server.
      command: 'pnpm build && pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 180 * 1000,
      env: {NEXT_PUBLIC_MOCK_API_URL: MOCK_API_URL},
    },
  ],
});

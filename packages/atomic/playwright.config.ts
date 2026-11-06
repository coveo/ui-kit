import {fileURLToPath} from 'node:url';
import {defineConfig, devices, type ReporterDescription} from '@playwright/test';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const DEFAULT_STORYBOOK_PORT = 4400;
const storybookPort = process.env.STORYBOOK_PORT
  ? parseInt(process.env.STORYBOOK_PORT, 10)
  : DEFAULT_STORYBOOK_PORT;

const DEFAULT_DESKTOP_VIEWPORT = {
  width: 1920,
  height: 1080,
};

function shardFromEnv() {
  const shard = process.env.TEST_SHARD;
  if (!shard) {
    return null;
  }
  const [current, total] = shard.split('/').map(Number);
  if (!Number.isInteger(current) || !Number.isInteger(total)) {
    throw new Error(`TEST_SHARD must be <current>/<total>, got "${shard}"`);
  }
  return {current, total};
}

const shard = shardFromEnv();

// On a shard, @flakiness/playwright gives every shard the same amount of measured test time instead
// of the same number of tests, from utils/ci/e2e-timings/atomic.json. Its report stays local.
const balancedShards: ReporterDescription[] = shard
  ? [
      [
        '@flakiness/playwright',
        {
          disableUpload: true,
          outputFolder: fileURLToPath(new URL('./test-results/flakiness-report', import.meta.url)),
          shardBalancing: {
            timingsFile: fileURLToPath(
              new URL('../../utils/ci/e2e-timings/atomic.json', import.meta.url)
            ),
          },
        },
      ],
    ]
  : [];

export default defineConfig({
  testDir: './src',
  testMatch: '*.e2e.ts',
  shard,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}{ext}',
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['html'],
        ['list'],
        ['github'],
        ['blob'],
        ['../../utils/ci/playwright-record-reporter.mjs'],
        ...balancedShards,
      ]
    : [['html'], ['list'], ...balancedShards],
  use: {
    trace: 'retain-on-failure',
    baseURL: isCDN
      ? 'http://localhost:3000/atomic/v3/storybook/'
      : `http://localhost:${storybookPort}`,
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
  // CI serves the static e2e build (build:storybook:e2e). The dev server compiled every story on
  // its first visit, and with one worker per shard that compilation dominated the shard time.
  webServer: process.env.CI
    ? {
        command: isCDN
          ? 'pnpm --filter @coveo/cdn start'
          : `pnpm exec ws --directory dist-storybook-e2e --port ${storybookPort}`,
        stdout: 'pipe',
        url: isCDN
          ? 'http://localhost:3000/atomic/v3/storybook/'
          : `http://localhost:${storybookPort}`,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
        gracefulShutdown: {signal: 'SIGTERM', timeout: 500},
      }
    : undefined,
});

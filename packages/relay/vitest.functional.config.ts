import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    name: 'functional',
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [
        {browser: 'chromium'},
        {browser: 'firefox'},
        {browser: 'webkit'},
      ],
    },
    globals: true,
    env: {
      VITE_ANALYTICS_KEY: process.env.VITE_ANALYTICS_KEY,
    },
    include: ['**/functional.test.ts'],
  },
});

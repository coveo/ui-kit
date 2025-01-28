import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // https://playwright.dev
      providerOptions: {},
    },
  },
});

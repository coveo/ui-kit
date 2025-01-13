import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/atomic-text.test.ts'],
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // https://playwright.dev
      providerOptions: {},
    },
  },
});

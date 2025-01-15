import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: [
      'src/**/initialization-utils.spec.ts',
      'src/**/search-layout.spec.ts',
    ],
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

import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  name: 'cdn-check',

  test: {
    includeSource: [
      './dist/proda/StaticCDN/**/*',
      '!./dist/proda/StaticCDN/atomic/*/storybook/**/*',
    ],
    root: './dist/proda/StaticCDN',
    include: ['../../../tests/**/*.spec.ts'],
    name: 'cdn-check',
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [
        {
          browser: 'chromium',
          headless: true,
          context: {
            actionTimeout: 3000,
          },
        },
      ],
    },
  },
});

import path from 'node:path';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {defineConfig} from 'vitest/config';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  name: 'atomic-storybook',
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    storybookTest({
      configDir: path.join(import.meta.dirname, '.storybook'),
      storybookUrl: 'http://localhost:4400',
      storybookScript: 'npm run dev',
      tags: {
        exclude: ['vitest'],
      },
    }),
  ],
  test: {
    name: 'atomic-storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{browser: 'chromium'}],
    },
    setupFiles: ['./vitest-utils/setup.ts', '.storybook/vitest.setup.ts'],
  },
});

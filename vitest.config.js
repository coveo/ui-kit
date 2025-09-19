import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './packages/atomic/vitest.config.js',
      './packages/bueno/vitest.config.js',
      './packages/shopify/vitest.config.js',
      './packages/headless/vitest.config.js',
      './packages/headless-react/vitest.config.js',
      './samples/headless/commerce-react/vitest.config.js',
      './samples/headless/search-react/vitest.config.js',
    ],
  },
});

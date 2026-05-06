import {resolve} from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@coveo/headless/package.json',
        replacement: resolve(__dirname, '../../../packages/headless/package.json'),
      },
      {
        find: '../../../generated/availableLocales.json',
        replacement: resolve(
          __dirname,
          '../../../packages/atomic/dist/esm/generated/availableLocales.js'
        ),
      },
    ],
  },
  server: {
    port: 3000,
  },
});

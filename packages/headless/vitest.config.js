import path from 'path';
import {defineConfig} from 'vitest/config';

process.env.TZ = 'Australia/Eucla';

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    // ...
    globals: true,
  },
  resolve: {
    alias: {
      '@coveo/pendragon': path.resolve(
        __dirname,
        'ponyfills/magic-cookie-node.js'
      ),
    },
  },
});

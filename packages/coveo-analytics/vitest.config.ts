import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@App': fileURLToPath(new URL('./src', import.meta.url)),
      // ESM namespaces are frozen, so the tests cannot spy on `cross-fetch`'s
      // exported `fetch`. Alias it to a module that exports a mock instead.
      'cross-fetch': fileURLToPath(new URL('./tests/crossFetch.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    globals: true,
    include: ['src/**/*.spec.ts', 'functional/**/*.spec.ts'],
    setupFiles: ['./tests/setup.js'],
  },
});

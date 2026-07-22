import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@App': fileURLToPath(new URL('./src', import.meta.url)),
      'cross-fetch': fileURLToPath(
        new URL('./tests/crossFetch.ts', import.meta.url)
      ),
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
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.ts'],
      reporter: ['lcov', 'cobertura', 'text-summary'],
    },
  },
});

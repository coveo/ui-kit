import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/e2e/**'],
    environment: 'jsdom',
  },
  define: {
    global: 'window',
  },
});

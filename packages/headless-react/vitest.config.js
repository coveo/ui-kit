import {defineConfig} from 'vitest/config';

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  define: {
    global: 'window',
  },
});

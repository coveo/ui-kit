import {defineConfig} from 'vitest/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const headlessFutureRoot = path.resolve(
  __dirname,
  '../../../packages/headless-future'
);

export default defineConfig({
  resolve: {
    alias: {
      '@': headlessFutureRoot,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['tests/**', '**/node_modules/**'],
  },
});

import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const headlessFutureRoot = path.resolve(
  __dirname,
  '../../../packages/headless-future'
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': headlessFutureRoot,
    },
  },
  server: {
    open: true,
  },
});

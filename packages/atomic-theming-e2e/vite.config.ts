import {resolve} from 'node:path';
import {defineConfig} from 'vite';

const DEFAULT_PORT = 3350;
const port = process.env.VITE_PORT ? Number.parseInt(process.env.VITE_PORT, 10) : DEFAULT_PORT;

export default defineConfig({
  root: resolve(import.meta.dirname, 'fixtures'),
  publicDir: resolve(import.meta.dirname, '../atomic/dist'),
  appType: 'mpa',
  server: {
    port,
    strictPort: true,
    host: '127.0.0.1',
  },
});

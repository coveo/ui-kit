import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  publicDir: resolve(import.meta.dirname, '../dist/atomic'),
  appType: 'mpa',
  server: {
    port: 3333,
  },
});

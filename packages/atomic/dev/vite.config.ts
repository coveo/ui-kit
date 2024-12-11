import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  publicDir: resolve(import.meta.dirname, '../dist/atomic'),
  server: {
    port: 3333,
  },
});

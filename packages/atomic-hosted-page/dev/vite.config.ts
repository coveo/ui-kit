import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  publicDir: resolve(import.meta.dirname, '../dist'),
  appType: 'mpa',
  server: {
    port: 3333,
  },
});

import {resolve} from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 3003,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        search: resolve(__dirname, 'search.html'),
        listing: resolve(__dirname, 'listing.html'),
      },
    },
  },
});

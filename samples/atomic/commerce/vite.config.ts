import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 3001,
  },
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        search: fileURLToPath(new URL('./search.html', import.meta.url)),
        listing: fileURLToPath(new URL('./listing.html', import.meta.url)),
        recommendations: fileURLToPath(
          new URL('./recommendations.html', import.meta.url)
        ),
      },
    },
  },
});

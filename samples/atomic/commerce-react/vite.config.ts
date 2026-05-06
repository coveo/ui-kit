import {fileURLToPath, URL} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

const vendor = (file: string) =>
  fileURLToPath(new URL(`./src/vendor/${file}`, import.meta.url));

const root = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '/bueno/v1.1.9/bueno.esm.js': root(
        '../../../packages/bueno/dist/bueno.esm.js'
      ),
      '@coveo/headless/package.json': vendor('headless-package.ts'),
      '@coveo/headless/commerce': root(
        '../../../packages/headless/cdn/commerce/headless.esm.js'
      ),
      '@coveo/headless/insight': root(
        '../../../packages/headless/cdn/insight/headless.esm.js'
      ),
      '@coveo/headless/recommendation': root(
        '../../../packages/headless/cdn/recommendation/headless.esm.js'
      ),
      '@coveo/headless': root('../../../packages/headless/cdn/headless.esm.js'),
    },
  },
  server: {
    port: 3005,
  },
});

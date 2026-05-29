import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {defineConfig} from 'vite';

const atomicPkg = resolve(__dirname, 'node_modules/@coveo/atomic');
const localesJson = resolve(atomicPkg, 'src/generated/availableLocales.json');

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 3000,
  },
  resolve: {
    alias: [
      // The atomic ESM build imports availableLocales.json via a relative path
      // but only emits a .js file. Redirect to the source JSON when available.
      ...(existsSync(localesJson)
        ? [
            {
              find: /\.\.\/.*generated\/availableLocales\.json$/,
              replacement: localesJson,
            },
          ]
        : []),
    ],
  },
});

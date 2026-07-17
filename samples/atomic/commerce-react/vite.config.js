import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, resolve} from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// Atomic serves its theme, icons and i18n from the server root at runtime.
// Resolve them from the installed @coveo/atomic package (via @coveo/atomic-react)
// and copy them into `public/` so Vite serves them in dev and build.
const require = createRequire(import.meta.url);
const atomicRequire = createRequire(require.resolve('@coveo/atomic-react'));
const themesDir = dirname(
  atomicRequire.resolve('@coveo/atomic/themes/coveo.css')
);
const distDir = dirname(themesDir);

const copies = [
  [resolve(distDir, 'assets'), 'public/assets'],
  [resolve(distDir, 'lang'), 'public/lang'],
  [themesDir, 'public/themes'],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    throw new Error(`Could not find Atomic's runtime files at ${from}.`);
  }
  mkdirSync(resolve(to), {recursive: true});
  cpSync(from, resolve(to), {recursive: true});
}

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
});

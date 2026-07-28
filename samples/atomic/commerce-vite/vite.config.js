import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {defineConfig} from 'vite';

// Copy Atomic's runtime i18n (`/lang`) and icons (`/assets`) from the installed
// @coveo/atomic package into `public/` so Vite serves them in dev and build.
const atomicPkg = resolve('node_modules/@coveo/atomic');

const findDir = (name) => {
  for (const candidate of [
    resolve(atomicPkg, 'dist', name),
    resolve(atomicPkg, 'dist', 'atomic', name),
  ]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

for (const name of ['lang', 'assets']) {
  const src = findDir(name);
  if (!src) {
    throw new Error(`Could not find @coveo/atomic's "${name}" directory under ${atomicPkg}/dist.`);
  }
  const dest = resolve('public', name);
  mkdirSync(dest, {recursive: true});
  cpSync(src, dest, {recursive: true});
}

export default defineConfig({
  // Multi-page app: home, search, and two product-listing pages.
  appType: 'mpa',
  server: {
    open: '/index.html',
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve('index.html'),
        search: resolve('search.html'),
        'listing-surf-accessories': resolve('listing-surf-accessories.html'),
        'listing-toys': resolve('listing-toys.html'),
      },
    },
  },
});

import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {defineConfig} from 'vite';

// Atomic loads its i18n language files from `/lang` and its icons from
// `/assets` at runtime. Copy them out of the installed `@coveo/atomic` package
// into `public/` so Vite serves them in both dev and the production build.
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
  if (src) {
    const dest = resolve('public', name);
    mkdirSync(dest, {recursive: true});
    cpSync(src, dest, {recursive: true});
  }
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

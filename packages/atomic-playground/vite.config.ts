import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {defaultClientConditions, defineConfig} from 'vite';
import {atomicSourcePlugins} from './vite/atomic-source-plugins.js';

const DEFAULT_PORT = 3400;
const port = process.env.PLAYGROUND_PORT
  ? Number.parseInt(process.env.PLAYGROUND_PORT, 10)
  : DEFAULT_PORT;

const monorepoRoot = resolve(import.meta.dirname, '../..');
const atomicDist = resolve(import.meta.dirname, '../atomic/dist');

const require = createRequire(import.meta.url);
const atomicVersion = require('../atomic/package.json').version;
// coveo.analytics is a Headless dependency, and its default entry is not browser-ready.
// The ESM build is what `analyticsTransformer` substitutes in during a real build.
const analyticsEsm = createRequire(resolve(monorepoRoot, 'packages/headless/package.json')).resolve(
  'coveo.analytics/dist/browser.mjs'
);

export default defineConfig({
  // Serves /assets, /lang and /themes. These come from copy-only scripts (`build:assets`,
  // `build:locales`, `build:themes`), not from compiling Atomic.
  publicDir: atomicDist,
  appType: 'mpa',
  server: {
    port,
    strictPort: true,
    host: '127.0.0.1',
    fs: {
      // Modules resolve to sibling packages' `src`, which sits outside the Vite root.
      allow: [monorepoRoot],
    },
  },
  define: {
    'process.env.VERSION': JSON.stringify(atomicVersion),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  resolve: {
    // Picks up the `source` export condition that @coveo/platform-mock-api declares.
    conditions: ['source', ...defaultClientConditions],
    // Atomic source and the playground must share one Lit instance, otherwise the
    // reactive element and context registries are duplicated.
    dedupe: ['lit', '@lit/context'],
    alias: [{find: /^coveo\.analytics$/, replacement: analyticsEsm}],
  },
  optimizeDeps: {
    include: [
      'dayjs',
      'dayjs/plugin/quarterOfYear.js',
      'dayjs/plugin/customParseFormat.js',
      'dayjs/plugin/timezone.js',
      'dayjs/plugin/utc.js',
    ],
  },
  plugins: atomicSourcePlugins(),
});

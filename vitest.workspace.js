import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  './packages/headless/vitest.config.js',
  './packages/samples/headless-commerce-react/vite.config.js',
  './packages/samples/headless-commerce-ssr-react-router/vite.config.ts',
  './packages/samples/headless-react/vite.config.js',
  // eslint-disable-next-line @cspell/spellchecker
  './packages/samples/vuejs/vite.config.ts',
  './packages/headless-react/vitest.config.js',
  './packages/atomic/vitest.config.ts',
  './packages/shopify/vitest.config.ts',
]);

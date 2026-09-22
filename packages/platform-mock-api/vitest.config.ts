import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

// `platform-mock-api` (private) has no `fast-check` of its own and must not add one (that would
// mutate the workspace lockfile/catalog). fast-check is already installed, hoisted under the
// sibling `@coveo/thermidor` package; alias the bare specifier to that copy so the property tests
// resolve it when run through the workspace vitest.
const fastCheck = fileURLToPath(
  new URL('../thermidor/node_modules/fast-check/lib/fast-check.js', import.meta.url)
);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      'fast-check': fastCheck,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});

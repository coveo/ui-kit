import {resolve} from 'node:path';
import {defineConfig} from 'vitest/config';

// The spec analyzes the sources through the analyzer's CLI, which changes the working directory
// for the duration of the call: that needs a process, not a thread. The analysis takes a few
// seconds alone and much longer on a busy CI runner.
export default defineConfig({
  test: {
    name: 'usage-docs',
    root: resolve(import.meta.dirname, '../..'),
    include: ['scripts/usage-docs/*.spec.mjs'],
    environment: 'node',
    pool: 'forks',
    hookTimeout: 120_000,
  },
});

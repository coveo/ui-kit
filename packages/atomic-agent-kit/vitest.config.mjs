import {defineConfig} from 'vitest/config';

// The specs analyze the Atomic sources through the analyzer's CLI, which changes the working
// directory for the duration of the call: that needs a process per spec file, not a thread.
// The analysis takes a few seconds alone and much longer on a busy CI runner.
export default defineConfig({
  test: {
    name: 'atomic-agent-kit',
    include: ['src/**/*.spec.mjs'],
    environment: 'node',
    pool: 'forks',
    hookTimeout: 120_000,
  },
});

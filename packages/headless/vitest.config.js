import {defineConfig} from 'vitest/config';

process.env.TZ = 'Australia/Eucla';

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    pool: 'threads',
    shard: process.env.VITEST_SHARD,
  },
});

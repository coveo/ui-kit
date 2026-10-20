import {defineConfig} from 'vitest/config';

process.env.TZ = 'Australia/Eucla';

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    // ...
    globals: true,
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.typecheck.json',
    },
  },
});

import {defineConfig} from 'vitest/config';

process.env.TZ = 'Australia/Eucla';

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    // ...
    globals: true,
  },
});

import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  test: {
    include: ['test/**/*.test.ts'],
  },
});

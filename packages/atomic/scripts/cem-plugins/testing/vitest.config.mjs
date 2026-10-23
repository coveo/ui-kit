import {resolve} from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'cem-plugins',
    root: resolve(import.meta.dirname, '..'),
    include: ['*.spec.mjs'],
    environment: 'node',
  },
});

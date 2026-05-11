import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: 'node',
          globals: true,
          include: ['**/*.test.ts'],
          exclude: ['**/*.jsdom.test.ts', '**/functional.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'jsdom',
          globals: true,
          include: ['**/*.jsdom.test.ts'],
          environment: 'jsdom',
        },
      },
    ],
  },
});

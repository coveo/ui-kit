import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

process.env.TZ = 'Australia/Eucla';

const headlessSrc = fileURLToPath(new URL('../headless/src', import.meta.url));

/**
 * Tests run against the headless sources, not its build, so that `vi.mock` of a headless module
 * also replaces it behind `@coveo/headless`, and so that tests can reach the shared headless
 * test mocks through the test-only `@coveo/headless-src/*` alias.
 */
const alias = [
  {find: /^@coveo\/headless$/, replacement: `${headlessSrc}/index.ts`},
  {find: /^@coveo\/headless\/commerce$/, replacement: `${headlessSrc}/commerce.index.ts`},
  {find: /^@coveo\/headless\/ssr-internal$/, replacement: `${headlessSrc}/ssr-internal.index.ts`},
  {find: /^@coveo\/headless-src\/(.*)\.js$/, replacement: `${headlessSrc}/$1.ts`},
];

export default defineConfig({
  resolve: {alias},
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          exclude: ['src/react/**'],
          typecheck: {
            enabled: true,
            include: ['src/**/*.test-d.ts'],
            tsconfig: './tsconfig.typecheck.json',
          },
        },
      },
      {
        extends: true,
        define: {global: 'window'},
        test: {
          name: 'react',
          environment: 'jsdom',
          include: ['src/react/**/*.test.ts', 'src/react/**/*.test.tsx'],
          setupFiles: ['./src/react/__tests__/setup.ts'],
        },
      },
    ],
  },
});

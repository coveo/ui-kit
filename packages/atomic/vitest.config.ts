import path from 'node:path';
import {defineConfig} from 'vitest/config';

const port = 63315;
const resourceUrl = `http://localhost:${port}/`;

export default defineConfig({
  define: {
    'import.meta.env.RESOURCE_URL': `"${resourceUrl}"`,
  },
  server: {
    port: port,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
  plugins: [
    {
      name: 'force-inline-css-imports',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.ts')) {
          return {
            code: code.replace(
              /import\s+([^'"]+)\s+from\s+['"]([^'"]+\.css)['"]/g,
              (_, importName, cssPath) =>
                `import ${importName} from '${cssPath}?inline'`
            ),
            map: null,
          };
        }
        return null;
      },
    },
  ],
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: [
      'src/**/initialization-utils.spec.ts',
      'src/**/search-layout.spec.ts',
    ],
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // https://playwright.dev
      providerOptions: {},
    },
  },
});

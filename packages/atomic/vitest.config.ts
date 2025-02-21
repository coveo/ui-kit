import path from 'node:path';
import {defineConfig} from 'vitest/config';

const port = 63315;
const resourceUrl = `http://localhost:${port}/`;

const externalizeSourceDependencies = (sources) => ({
  name: 'externalize-source-dependencies',
  resolveId: (source) =>
    sources.includes(source) ? {id: source, external: true} : null,
});

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
    externalizeSourceDependencies([
      /* @web/test-runner requires a web-socket connection to function properly.
       * Saying to Vite /__web-dev-server__web-socket.js is an external dependency served by @web/dev-server. */
      '/__web-dev-server__web-socket.js',
    ]),
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

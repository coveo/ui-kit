import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import {defineConfig} from 'vitest/config';
//@ts-expect-error - normal json import
import packageJson from './package.json' with {type: 'json'};

const port = 63315;
const resourceUrl = `http://localhost:${port}/`;

export default defineConfig({
  define: {
    'import.meta.env.RESOURCE_URL': `"${resourceUrl}"`,
    __ATOMIC_VERSION__: `"${packageJson.version}"`,
    __HEADLESS_VERSION__: `"${packageJson.dependencies['@coveo/headless']}"`,
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
    tailwindcss(),
  ],
  test: {
    setupFiles: ['./vitest-utils/setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: [
      'src/**/initialization-utils.spec.ts',
      'src/**/search-layout.spec.ts',
    ],
    css: true,
    globals: true,
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../packages')],
    },
    browser: {
      provider: 'playwright',
      enabled: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});

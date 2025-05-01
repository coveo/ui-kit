import {readFileSync} from 'fs';
import path from 'node:path';
import {dirname, resolve} from 'path';
import {defineConfig} from 'vitest/config';
//@ts-expect-error - normal json import
import packageJson from './package.json' with {type: 'json'};

const port = 63315;
const resourceUrl = `http://localhost:${port}/`;

/**
 * Custom SVG transformer to handle .svg imports.
 */
function svgTransform(code, id) {
  return code.replace(
    /import\s+([a-zA-Z]+)\s+from\s+['"]([^'"]+\.svg)['"]/g,
    (_, importName, importPath) => {
      const svgContent = readFileSync(resolve(dirname(id), importPath), 'utf8')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '');
      return `const ${importName} = '${svgContent}'`;
    }
  );
}

export default defineConfig({
  define: {
    'import.meta.env.RESOURCE_URL': `"${resourceUrl}"`,
    __ATOMIC_VERSION__: `"${packageJson.version}"`,
    __HEADLESS_VERSION__: `"${packageJson.dependencies['@coveo/headless']}"`,
    'process.env': {},
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
    {
      name: 'svg-transform',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.ts')) {
          const transformedCode = svgTransform(code, id);
          return {
            code: transformedCode,
            map: null,
          };
        }
        return null;
      },
    },
  ],
  test: {
    include: ['src/**/*.spec.ts', 'scripts/stencil-proxy.spec.mjs'],
    exclude: [
      'src/**/initialization-utils.spec.ts',
      'src/**/search-layout.spec.ts',
    ],
    restoreMocks: true,
    setupFiles: ['./vitest-utils/setup.ts'],
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
          context: {
            actionTimeout: 3000,
          },
        },
      ],
    },
  },
});

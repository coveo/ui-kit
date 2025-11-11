import {readFileSync} from 'node:fs';
import path, {dirname, resolve} from 'node:path';
import replacePlugin from '@rollup/plugin-replace';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import {playwright} from '@vitest/browser-playwright';
import {configDefaults, defineConfig} from 'vitest/config';
import packageJsonHeadless from '../headless/package.json' with {type: 'json'};
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

function replace() {
  return replacePlugin({
    values: {
      'process.env.VERSION': `"0.0.0"`,
      'import.meta.env.RESOURCE_URL': `"${resourceUrl}"`,
      __ATOMIC_VERSION__: `"${packageJson.version}"`,
      __HEADLESS_VERSION__: `"${packageJsonHeadless.version}"`,
    },
    preventAssignment: true,
  });
}

const atomicDefault = defineConfig({
  name: 'atomic-default',
  server: {
    port: port,
  },
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: `${path.resolve(import.meta.dirname, './')}/`,
      },
      {
        find: '../components/components/lazy-index.js',
        replacement: path.resolve(
          import.meta.dirname,
          'src/components/lazy-index.js'
        ),
      },
    ],
  },
  plugins: [
    replace(),
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
    name: 'atomic-default',
    css: true,
    include: ['src/**/*.spec.ts', 'scripts/stencil-proxy.spec.mjs'],
    exclude: [
      ...configDefaults.exclude,
      'src/**/initialization-utils.spec.ts',
      'src/**/search-layout.spec.ts',
    ],
    setupFiles: ['./vitest-utils/setup.ts'],
    browser: {
      provider: playwright(),
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

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const storybook = defineConfig({
  name: 'storybook',
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    storybookTest({
      configDir: path.join(import.meta.dirname, '.storybook'),
      storybookUrl: 'http://localhost:4400',
      storybookScript: 'npx storybook dev -p 4400 --no-open',
    }),
  ],
  test: {
    name: 'storybook',
    fileParallelism: false,
    browser: {
      fileParallelism: false,
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{browser: 'chromium'}],
      context: {
        actionTimeout: 3000,
      },
    },
    setupFiles: ['./vitest-utils/setup.ts', '.storybook/vitest.setup.ts'],
  },
});

export default defineConfig({test: {projects: [atomicDefault, storybook]}});

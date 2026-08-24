import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const thermidorSchemaPackageDirectory = resolve(
  fileURLToPath(new URL('./packages/thermidor-schema/packages/typescript', import.meta.url))
);
const isThermidorSchemaPackage = resolve(process.cwd()) === thermidorSchemaPackageDirectory;

export default defineConfig({
  test: isThermidorSchemaPackage
    ? {
        include: ['test/**/*.test.ts'],
      }
    : {
        projects: [
          './packages/atomic/vitest.config.js',
          './packages/atomic-a11y/vitest.config.ts',
          './packages/auth/vitest.config.js',
          './packages/bueno/vitest.config.js',
          './packages/shopify/vitest.config.js',
          './packages/headless/vitest.config.js',
          './packages/thermidor/vitest.config.js',
          './packages/headless-react/vitest.config.js',
          './samples/headless/commerce-react/vitest.config.js',
          './samples/headless/search-react/vitest.config.js',
        ],
      },
});

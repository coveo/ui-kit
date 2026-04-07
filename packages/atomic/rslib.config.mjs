import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from '@rslib/core';
import {litCssPlugin} from './scripts/lit-css-plugin.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const {version} = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf8')
);

const shared = {
  bundle: false,
  syntax: 'es2021',
  redirect: {
    style: {
      path: true,
      extension: true,
    },
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      dts: {
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  source: {
    entry: {
      index: [
        './src/**/*.ts',
        '!./src/**/*.spec.ts',
        '!./src/**/*.d.ts',
        '!./src/**/e2e/**',
      ],
    },
    define: {
      'process.env.VERSION': JSON.stringify(version),
      // import.meta.url is only used for CDN detection in resource-url-utils.ts.
      // CDN builds go through rsbuild (not rslib), so safe to stub it out here.
      // This also prevents CJS output from containing invalid import.meta syntax.
      'import.meta.url': JSON.stringify('https://localhost'),
    },
    decorators: {
      version: 'legacy',
    },
    tsconfigPath: './tsconfig.lit.json',
  },
  output: {
    target: 'web',
    cleanDistPath: true,
  },
  plugins: [litCssPlugin()],
});

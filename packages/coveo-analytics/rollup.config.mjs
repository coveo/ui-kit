import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {parse, resolve} from 'path';
import packageJson from './package.json' with {type: 'json'};
import * as url from 'url';

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const browserFetch = () =>
  alias({
    entries: [
      {
        find: 'cross-fetch',
        replacement: resolve(__dirname, './bundle/browser-fetch.ts'),
      },
    ],
  });

const tsPlugin = () =>
  typescript({
    tsconfig: './tsconfig.json',
  });

const versionReplace = () =>
  replace({
    preventAssignment: true,
    include: 'src/version.ts',
    delimiters: ["'", "'"],
    local: JSON.stringify(packageJson.version), // replaces 'local' in src/version.ts
  });

/**
 * `@rollup/plugin-typescript` emits declarations from the on-disk sources, so the
 * `local` placeholder in `src/version.ts` survives into `version.d.ts` even though
 * `versionReplace` rewrites it in the bundles. Patch the emitted declaration so the
 * published types keep announcing the real version.
 */
const versionReplaceInDeclaration = () => ({
  name: 'version-replace-in-declaration',
  writeBundle() {
    const declaration = resolve(__dirname, './dist/definitions/version.d.ts');
    if (!existsSync(declaration)) {
      return;
    }
    const contents = readFileSync(declaration, 'utf8');
    writeFileSync(
      declaration,
      contents
        .replace("'local'", `'${packageJson.version}'`)
        .replace('"local"', `"${packageJson.version}"`)
    );
  },
});

/**
 * @param {{sourceFileName: string, aliasFileName: string}} options
 */
const aliasFile = ({sourceFileName, aliasFileName}) => {
  const {dir: dest, base: rename} = parse(aliasFileName);
  return copy({
    hook: 'writeBundle',
    targets: [{src: sourceFileName, dest, rename}],
  });
};

/**
 * @satisfies {RollupOptions}
 */
const coveouaConfig = {
  input: './src/coveoua/browser.ts',
  output: [
    {
      file: './dist/coveoua.js',
      format: 'umd',
      name: 'coveoua',
      sourcemap: true,
      plugins: [terser({format: {comments: false}})],
    },
    {
      file: './dist/coveoua.browser.js',
      format: 'iife',
      name: 'coveoua',
      sourcemap: true,
      plugins: [terser({format: {comments: false}})],
    },
    {
      file: './dist/coveoua.debug.js',
      format: 'umd',
      name: 'coveoua',
      sourcemap: true,
    },
  ],
  plugins: [
    browserFetch(),
    nodeResolve({preferBuiltins: true, browser: true}),
    versionReplace(),
    tsPlugin(),
    process.env.SERVE
      ? serve({
          contentBase: ['dist', 'public'],
          port: 9001,
          open: true,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:9001',
          },
        })
      : null,
  ],
};

/**
 * @satisfies {RollupOptions}
 */
const nodeModulesConfig = {
  input: './src/coveoua/library.ts',
  output: [
    {
      file: `./dist/library.cjs`,
      format: 'cjs',
      plugins: [
        aliasFile({
          sourceFileName: './dist/library.cjs',
          aliasFileName: './dist/library.js',
        }),
      ],
    },
    {
      file: `./dist/library.mjs`,
      format: 'es',
    },
  ],
  plugins: [
    nodeResolve({mainFields: ['main'], preferBuiltins: true}),
    versionReplace(),
    commonjs(),
    tsPlugin(),
    json(),
  ],
};

/**
 * @satisfies {RollupOptions}
 */
const browserModulesConfig = {
  input: './src/coveoua/headless.ts',
  output: {
    file: `./dist/browser.mjs`,
    format: 'es',
  },
  plugins: [
    browserFetch(),
    nodeResolve({preferBuiltins: true}),
    versionReplace(),
    typescript({
      tsconfig: './tsconfig.json',
      target: 'es6',
    }),
    aliasFile({
      sourceFileName: './dist/browser.mjs',
      aliasFileName: './dist/library.es.js',
    }),
  ],
};

/**
 * @satisfies {RollupOptions}
 */
const reactNativeConfig = {
  external: ['react-native', 'cross-fetch'],
  input: './src/react-native/index.ts',
  output: {
    file: './dist/react-native.es.js',
    format: 'es',
  },
  plugins: [
    nodeResolve({preferBuiltins: true}),
    versionReplace(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      target: 'es6',
    }),
    versionReplaceInDeclaration(),
  ],
};

export default [coveouaConfig, nodeModulesConfig, browserModulesConfig, reactNativeConfig];

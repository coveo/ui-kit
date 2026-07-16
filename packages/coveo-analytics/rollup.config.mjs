import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
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

const tsPlugin = (compilerOptions = {}) =>
  typescript({
    compilerOptions,
  });

const versionReplace = () =>
  replace({
    preventAssignment: true,
    include: 'src/version.ts',
    delimiters: ["'", "'"],
    local: JSON.stringify(packageJson.version), // replaces 'local' in src/version.ts
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
    tsPlugin({sourceMap: false}),
    json(),
    aliasFile({
      sourceFileName: './dist/library.cjs',
      aliasFileName: './dist/library.js',
    }),
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
    tsPlugin({sourceMap: false, target: 'ES6'}),
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
    tsPlugin({sourceMap: false, target: 'ES6'}),
  ],
};

export default [
  coveouaConfig,
  nodeModulesConfig,
  browserModulesConfig,
  reactNativeConfig,
];

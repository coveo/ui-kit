import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import {defineConfig} from 'rollup';
import nodePolyfills from 'rollup-plugin-polyfill-node';

/** @type {import("rollup").GlobalsOption} */
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/client': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
  '@coveo/atomic': 'CoveoAtomic',
  '@coveo/headless': 'CoveoHeadless',
};

/** @type {import('rollup').ExternalOption} */
const commonExternal = [
  'react',
  'react-dom',
  'react-dom/client',
  'react-dom/server',
  '@coveo/atomic',
  '@coveo/headless',
];

/** @returns {import('rollup').OutputOptions} */
const outputIIFE = ({minify}) => ({
  file: `dist/iife/atomic-react${minify ? '.min' : ''}.js`,
  format: 'iife',
  name: 'CoveoAtomicReact',
  globals,
  plugins: minify ? [terser()] : [],
});

/** @returns {import('rollup').OutputOptions} */
const outputIIFERecs = ({minify}) => ({
  file: `dist/iife/atomic-react/recommendation${minify ? '.min' : ''}.js`,
  format: 'iife',
  name: 'CoveoAtomicReactRecommendation',
  globals,
  plugins: minify ? [terser()] : [],
});

/** @returns {import('rollup').OutputOptions} */
const outputIIFECommerce = ({minify}) => ({
  file: `dist/iife/atomic-react/commerce${minify ? '.min' : ''}.js`,
  format: 'iife',
  name: 'CoveoAtomicReactCommerce',
  globals,
  plugins: minify ? [terser()] : [],
});

const plugins = [
  nodePolyfills(),
  typescript({tsconfig: 'tsconfig.iife.json'}),
  commonjs(),
  nodeResolve(),
  replace({
    delimiters: ['', ''],
    values: {
      'process.env.NODE_ENV': JSON.stringify('dev'),
      'util.TextEncoder();': 'TextEncoder();',
      "import { defineCustomElements } from '@coveo/atomic/loader';": '',
      'defineCustomElements();': '',
    },
  }),
];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [outputIIFE({minify: true}), outputIIFE({minify: false})],
    external: commonExternal,
    plugins,
  },
  {
    input: 'src/recommendation.index.ts',
    output: [outputIIFERecs({minify: true}), outputIIFERecs({minify: false})],
    external: commonExternal,
    plugins,
  },
  {
    input: 'src/commerce.index.ts',
    output: [
      outputIIFECommerce({minify: true}),
      outputIIFECommerce({minify: false}),
    ],
    external: commonExternal,
    plugins,
  },
]);

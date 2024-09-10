import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
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
const outputIIFE = ({minify, subpath, name}) => ({
  file: `dist/iife/atomic-react${subpath}${minify ? '.min' : ''}.js`,
  format: 'iife',
  name,
  globals,
  plugins: minify ? [terser()] : [],
});

/**@returns {import('rollup').InputPluginOption} */
const iifePlugins = [
  json(),
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

/**@returns {import('rollup').RollupOptions[]} */
const rollupOptionsIIFE = [
  {
    input: 'src/index.ts',
    output: [
      outputIIFE({
        minify: true,
        subpath: '',
        name: 'CoveoAtomicReact',
      }),
      outputIIFE({
        minify: false,
        subpath: '',
        name: 'CoveoAtomicReact',
      }),
    ],
    external: commonExternal,
    plugins: iifePlugins,
  },
  {
    input: 'src/recommendation.index.ts',
    output: [
      outputIIFE({
        minify: true,
        subpath: '/recommendation',
        name: 'CoveoAtomicReactRecommendation',
      }),
      outputIIFE({
        minify: false,
        subpath: '/recommendation',
        name: 'CoveoAtomicReactRecommendation',
      }),
    ],
    external: commonExternal,
    plugins: iifePlugins,
  },
  {
    input: 'src/commerce.index.ts',
    output: [
      outputIIFE({
        minify: true,
        subpath: '/commerce',
        name: 'CoveoAtomicReactCommerce',
      }),
      outputIIFE({
        minify: false,
        subpath: '/commerce',
        name: 'CoveoAtomicReactCommerce',
      }),
    ],
    external: commonExternal,
    plugins: iifePlugins,
  },
];

/** @returns {import('rollup').OutputOptions} */
const outputESM = ({subpath}) => ({
  file: `dist/atomic-react${subpath}.mjs`,
  format: 'esm',
});

/**@returns {import('rollup').InputPluginOption} */
const esmPlugins = [typescript({tsconfig: 'tsconfig.esm.json'})];

/**@returns {import('rollup').RollupOptions[]} */
const rollupOptionsESM = [
  {
    input: 'src/index.ts',
    output: outputESM({subpath: ''}),
    external: commonExternal,
    plugins: esmPlugins,
  },
  {
    input: 'src/recommendation.index.ts',
    output: outputESM({subpath: '/recommendation'}),
    external: commonExternal,
    plugins: esmPlugins,
  },
  {
    input: 'src/commerce.index.ts',
    output: outputESM({subpath: '/commerce'}),
    external: commonExternal,
    plugins: esmPlugins,
  },
];

// /** @returns {import('rollup').OutputOptions} */
// const outputCJS = ({subpath}) => ({
//   file: `dist/cjs/atomic-react${subpath}.cjs`,
//   format: 'cjs',
//   exports: 'auto',
// });

// /**@returns {import('rollup').InputPluginOption} */
// const cjsPlugins = [
//   nodeResolve({extensions: ['.ts', '.js']}),
//   typescript({tsconfig: 'tsconfig.cjs.json'}),
// ];

// /**@returns {import('rollup').RollupOptions[]} */
// const rollupOptionsCJS = [
//   {
//     input: 'src/index.ts',
//     output: outputCJS({subpath: ''}),
//     external: commonExternal,
//     plugins: cjsPlugins,
//   },
//   {
//     input: 'src/recommendation.index.ts',
//     output: outputCJS({subpath: '/recommendation'}),
//     external: commonExternal,
//     plugins: cjsPlugins,
//   },
//   {
//     input: 'src/commerce.index.ts',
//     output: outputCJS({subpath: '/commerce'}),
//     external: commonExternal,
//     plugins: cjsPlugins,
//   },
// ];

export default defineConfig([
  ...rollupOptionsESM,
  // ...rollupOptionsCJS,
  ...rollupOptionsIIFE,
]);

import replaceWithASTPlugin from '@coveo/rollup-plugin-replace-with-ast';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
// import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {defineConfig} from 'rollup';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

let headlessVersion;

if (isCDN) {
  console.log('Building for CDN');

  const headlessPackageJsonPath = join(
    __dirname,
    '../../packages/headless/package.json'
  );

  try {
    const headlessPackageJson = JSON.parse(
      readFileSync(headlessPackageJsonPath, 'utf8')
    );
    headlessVersion = 'v' + headlessPackageJson.version;
    console.log('Using headless version from package.json:', headlessVersion);
  } catch (error) {
    console.error('Error reading headless package.json:', error);
    throw new Error('Error reading headless package.json');
  }
}

function generateReplaceValues() {
  return Object.entries(packageMappings).reduce((acc, [find, paths]) => {
    acc[find] = paths.cdn;
    return acc;
  }, {});
}

const packageMappings = {
  '@coveo/headless/commerce': {
    cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
  },
  '@coveo/headless/insight': {
    cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
  },
  '@coveo/headless/recommendation': {
    cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
  },
  '@coveo/headless/case-assist': {
    cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
  },
  '@coveo/headless': {
    cdn: `/headless/${headlessVersion}/headless.esm.js`,
  },
};

// /** @type {import("rollup").GlobalsOption} */
// const globals = {
//   react: 'React',
//   'react-dom': 'ReactDOM',
//   'react-dom/client': 'ReactDOM',
//   'react-dom/server': 'ReactDOMServer',
//   '@coveo/atomic': 'CoveoAtomic',
//   '@coveo/headless': 'CoveoHeadless',
// };

/** @type {import('rollup').ExternalOption} */
const commonExternal = [
  'react',
  'react-dom',
  'react-dom/client',
  'react-dom/server',
  '@coveo/atomic',
  '@coveo/headless',
];

// /** @returns {import('rollup').OutputOptions} */
// const outputIIFE = ({minify}) => ({
//   file: `dist/iife/atomic-react${minify ? '.min' : ''}.js`,
//   format: 'iife',
//   name: 'CoveoAtomicReact',
//   globals,
//   plugins: minify ? [terser()] : [],
// });

/** @returns {import('rollup').OutputOptions} */
const outputCJS = ({useCase}) => ({
  file: `dist/cjs/${useCase}atomic-react.cjs`,
  format: 'cjs',
});

// /** @returns {import('rollup').OutputOptions} */
// const outputIIFERecs = ({minify}) => ({
//   file: `dist/iife/atomic-react/recommendation${minify ? '.min' : ''}.js`,
//   format: 'iife',
//   name: 'CoveoAtomicReactRecommendation',
//   globals,
//   plugins: minify ? [terser()] : [],
// });

// /** @returns {import('rollup').OutputOptions} */
// const outputIIFECommerce = ({minify}) => ({
//   file: `dist/iife/atomic-react/commerce${minify ? '.min' : ''}.js`,
//   format: 'iife',
//   name: 'CoveoAtomicReactCommerce',
//   globals,
//   plugins: minify ? [terser()] : [],
// });

const plugins = [
  isCDN &&
    replaceWithASTPlugin({
      replacements: generateReplaceValues(),
    }),
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

const pluginsCJS = [
  json(),
  nodePolyfills(),
  typescript(),
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
  // {
  //   input: 'src/index.ts',
  //   output: [outputIIFE({minify: true}), outputIIFE({minify: false})],
  //   external: commonExternal,
  //   plugins,
  // },
  {
    input: 'src/index.ts',
    output: [outputCJS({useCase: ''})],
    external: commonExternal,
    plugins: pluginsCJS,
  },
  // {
  //   input: 'src/recommendation.index.ts',
  //   output: [outputIIFERecs({minify: true}), outputIIFERecs({minify: false})],
  //   external: commonExternal,
  //   plugins,
  // },
  {
    input: 'src/recommendation.index.ts',
    output: [outputCJS({useCase: 'recommendation/'})],
    external: commonExternal,
    plugins: pluginsCJS,
  },
  // {
  //   input: 'src/commerce.index.ts',
  //   output: [
  //     outputIIFECommerce({minify: true}),
  //     outputIIFECommerce({minify: false}),
  //   ],
  //   external: commonExternal,
  //   plugins,
  // },
  {
    input: 'src/commerce.index.ts',
    output: [outputCJS({useCase: 'commerce/'})],
    external: commonExternal,
    plugins: pluginsCJS,
  },
]);

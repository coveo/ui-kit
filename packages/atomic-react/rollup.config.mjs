import replaceWithASTPlugin from '@coveo/rollup-plugin-replace-with-ast';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
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

//TODO(alex): Should I add package mappings for atomic ?
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
const outputCJS = ({useCase}) => ({
  file: `dist/cjs/${useCase}atomic-react.cjs`,
  format: 'cjs',
});

//TODO(alex): also output types, a mts and dts file
//TODO(alex): output sourcemaps

/** @returns {import('rollup').OutputOptions} */
const outputESM = ({useCase}) => ({
  file: `dist/esm/${useCase}atomic-react.mjs`,
  format: 'esm',
});

/**@type {import('rollup').InputPluginOption} */
const plugins = [
  json(),
  nodePolyfills(),
  typescript(),
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
  isCDN &&
    replaceWithASTPlugin({
      replacements: generateReplaceValues(),
    }),
];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [outputCJS({useCase: ''})],
    external: commonExternal,
    plugins: plugins,
  },
  //I should do this : https://gist.github.com/kripod/8a01a8a7f5baa1d121dcd07eb8a943b9
  {
    input: 'src/index.ts',
    output: [outputESM({useCase: ''})],
    external: commonExternal,
    plugins: plugins,
  },
  {
    input: 'src/recommendation.index.ts',
    output: [outputCJS({useCase: 'recommendation/'})],
    external: commonExternal,
    plugins: plugins,
  },
  {
    input: 'src/recommendation.index.ts',
    output: [outputESM({useCase: 'recommendation/'})],
    external: commonExternal,
    plugins: plugins,
  },
  {
    input: 'src/commerce.index.ts',
    output: [outputCJS({useCase: 'commerce/'})],
    external: commonExternal,
    plugins: plugins,
  },
  {
    input: 'src/commerce.index.ts',
    output: [outputESM({useCase: 'commerce/'})],
    external: commonExternal,
    plugins: plugins,
  },
]);

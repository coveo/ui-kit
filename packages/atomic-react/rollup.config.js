import replaceWithASTPlugin from '@coveo/rollup-plugin-replace-with-ast';
import {nodeResolve} from '@rollup/plugin-node-resolve';
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
let atomicVersion;

if (isCDN) {
  console.log('Building for CDN');

  const headlessPackageJsonPath = join(
    __dirname,
    '../../packages/headless/package.json'
  );
  const atomicPackageJsonPath = join(
    __dirname,
    '../../packages/atomic/package.json'
  );

  try {
    const headlessPackageJson = JSON.parse(
      readFileSync(headlessPackageJsonPath, 'utf8')
    );
    headlessVersion = 'v' + headlessPackageJson.version;
    console.log('Using headless version from package.json:', headlessVersion);

    const atomicPackageJson = JSON.parse(
      readFileSync(atomicPackageJsonPath, 'utf8')
    );
    atomicVersion = 'v' + atomicPackageJson.version;
    console.log('Using atomic version from package.json:', atomicVersion);
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
  '@coveo/atomic/loader': {
    cdn: `/atomic/${atomicVersion}/loader/index.js`,
  },
};

/** @type {import('rollup').ExternalOption} */
const commonExternal = [
  'react',
  'react-dom',
  'react-dom/client',
  'react-dom/server',
  '@coveo/atomic/loader',
  '@coveo/headless',
];

/** @returns {import('rollup').OutputOptions} */
const outputCJS = ({useCase}) => ({
  file: `dist/cjs/${useCase}atomic-react.cjs`,
  format: 'cjs',
  sourcemap: true,
});

/** @returns {import('rollup').OutputOptions} */
const outputESM = ({useCase}) => ({
  file: `dist/esm/${useCase}atomic-react.mjs`,
  format: 'esm',
  sourcemap: true,
});

/**@type {import('rollup').InputPluginOption} */
const plugins = [
  nodePolyfills(),
  typescript(),
  nodeResolve(),
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

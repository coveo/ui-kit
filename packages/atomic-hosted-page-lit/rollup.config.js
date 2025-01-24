//loader
//component.d.ts
// /atomic-hosted-page/atomic-hosted-page.esm.js
// import from @coveo/atomic-hosted-page/loader
/**
 * have some sort of build tool that creates the atomic-hosted-page.esm.js file properly that includes the autoloader thingy like in atomic
 * It needs to bundle Lit but keep the other dependencies as external (using the cdn links for CDN env)
 */
/**
 * Folder structure
 *
 * ------------------
 * atomic-hosted-page/dist/atomic-hosted-page/atomic-hosted-page.esm.js
 *
 * import 'autoloader/index.esm.js';
 *
 * export lazy-index
 *
 * ------------------
 * atomic-hosted-page/loader/index.js
 *
 * export function defineCustomElements(){}
 */
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {defineConfig} from 'rollup';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const isNightly = process.env.IS_NIGHTLY === 'true';

let headlessVersion;
let buenoVersion;

if (isCDN) {
  console.log('Building for CDN');

  const headlessPackageJsonPath = join(
    __dirname,
    '../../packages/headless/package.json'
  );
  const atomicPackageJsonPath = join(
    __dirname,
    '../../packages/bueno/package.json'
  );

  try {
    const headlessPackageJson = JSON.parse(
      readFileSync(headlessPackageJsonPath, 'utf8')
    );
    headlessVersion = isNightly
      ? `v${headlessPackageJson.version.split('.').shift()}-nightly`
      : 'v' + headlessPackageJson.version;
    console.log('Using headless version from package.json:', headlessVersion);

    const atomicPackageJson = JSON.parse(
      readFileSync(atomicPackageJsonPath, 'utf8')
    );
    buenoVersion = isNightly
      ? `v${atomicPackageJson.version.split('.').shift()}-nightly`
      : 'v' + atomicPackageJson.version;
    console.log('Using bueno version from package.json:', buenoVersion);
  } catch (error) {
    console.error('Error reading headless package.json:', error);
    throw new Error('Error reading headless package.json');
  }
}

const packageMappings = {
  '@coveo/headless': {
    cdn: `/headless/${headlessVersion}/headless.esm.js`,
  },
  '@coveo/bueno': {
    cdn: `/atomic/${buenoVersion}/bueno.esm.js`,
  },
};

const externalizeDependenciesPlugin = () => {
  return {
    name: 'externalize-dependencies',
    resolveId: (source, _importer, _options) => {
      const packageMapping = packageMappings[source];

      if (packageMapping) {
        console.log(`Package cdn import : ${packageMapping.cdn}`);

        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }

      return null;
    },
  };
};

/** @type {import('rollup').ExternalOption} */
const commonExternal = ['@coveo/headless', '@coveo/bueno', 'lit'];

/** @type {import('rollup').ExternalOption} */
const cdnExternal = ['@coveo/headless', '@coveo/bueno'];

/** @returns {import('rollup').OutputOptions} */
const outputESM = () => ({
  file: `dist-rollup/atomic-hosted-page/atomic-hosted-page.esm.js`,
  format: 'esm',
  sourcemap: true,
});

/**@type {import('rollup').InputPluginOption} */
const plugins = [
  nodePolyfills(),
  nodeResolve(),
  isCDN && externalizeDependenciesPlugin(),
];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [outputESM()],
    external: isCDN ? cdnExternal : commonExternal,
    plugins: plugins,
  },
]);

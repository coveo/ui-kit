import {globalExternals} from '@fal-works/esbuild-plugin-global-externals';
import {build} from 'esbuild';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const USE_CASES = {
  search: 'src/components/search/index.ts',
  recommendation: 'src/components/recommendation/index.ts',
  commerce: 'src/components/commerce/index.ts',
};
/**
 * Defined global variables for external modules. This is required for IIFE format.
 * Have to specify the named exports for each module. (https://github.com/fal-works/esbuild-plugin-global-externals/issues/4)
 * @type {Record<string, import('@fal-works/esbuild-plugin-global-externals').ModuleInfo}
 */
const globals = {
  react: {
    varName: 'React',
    namedExports: ['useEffect', 'useRef'],
  },
  'react-dom/client': {varName: 'ReactDOMClient', namedExports: ['createRoot']},
  'react-dom/server': {
    varName: 'ReactDOMServer',
    namedExports: ['renderToString'],
  },
  '@coveo/atomic': {varName: 'CoveoAtomic'},
  '@coveo/headless': {
    varName: 'CoveoHeadless',
    namedExports: ['getSampleSearchEngineConfiguration', 'buildSearchEngine'],
  },
};

/**
 *
 * @type {import('esbuild').BuildOptions}
 */
const BASE_CONFIG = {
  bundle: true,
  banner: {js: apacheLicense()},
  external: ['react', 'react-dom', '@coveo/headless', '@coveo/atomic'],
};

/**
 * Builds the ESM format for browser.
 * @param {string} entryPoint - The entry point file path.
 * @param {string} useCaseName - The use case name to distinguish the output files.
 */
async function browserEsm(entryPoint, useCaseName) {
  return await build({
    ...BASE_CONFIG,
    entryPoints: [entryPoint],
    outfile: `dist/${useCaseName}/atomic-react.browser.mjs`,
    format: 'esm',
    platform: 'browser',
  });
}

/**
 * Builds the ESM format for Node.js.
 * @param {string} entryPoint - The entry point file path.
 * @param {string} useCaseName - The use case name to distinguish the output files.
 */
async function esm(entryPoint, useCaseName) {
  return await build({
    ...BASE_CONFIG,
    entryPoints: [entryPoint],
    outfile: `dist/${useCaseName}/atomic-react.mjs`,
    format: 'esm',
    platform: 'node',
  });
}

/**
 * Builds the CJS format for Node.js.
 * @param {string} entryPoint - The entry point file path.
 * @param {string} useCaseName - The use case name to distinguish the output files.
 */
async function cjs(entryPoint, useCaseName) {
  return await build({
    ...BASE_CONFIG,
    entryPoints: [entryPoint],
    outfile: `dist/${useCaseName}/atomic-react.cjs`,
    format: 'cjs',
    platform: 'node',
  });
}

/**
 * Builds the IIFE format for browser.
 * @param {string} entryPoint - The entry point file path.
 * @param {string} useCaseName - The use case name to distinguish the output files.
 */
async function iife(entryPoint, useCaseName) {
  return await build({
    ...BASE_CONFIG,
    entryPoints: [entryPoint],
    outfile: `dist/${useCaseName}/atomic-react.iife.js`,
    format: 'iife',
    platform: 'browser',
    globalName: `CoveoAtomicReact${useCaseName == 'search' ? '' : useCaseName}`,
    plugins: [globalExternals(globals)],
  });
}

async function main() {
  const buildPromises = Object.entries(USE_CASES).flatMap(
    ([useCaseName, entryPoint]) => [
      browserEsm(entryPoint, useCaseName),
      esm(entryPoint, useCaseName),
      cjs(entryPoint, useCaseName),
      iife(entryPoint, useCaseName),
    ]
  );
  await Promise.all(buildPromises);
}

main();

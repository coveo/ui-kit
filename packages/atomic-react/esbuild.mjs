import {build} from 'esbuild';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const USE_CASES = {
  search: 'src/components/search/index.ts',
  recommendation: 'src/components/recommendation/index.ts',
  commerce: 'src/components/commerce/index.ts',
};

/**
 *
 * @type {import('esbuild').BuildOptions}
 */
const BASE_CONFIG = {
  bundle: true,
  banner: {js: apacheLicense()},
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
    globalName: 'AtomicReact',
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

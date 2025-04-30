import {build} from '../../scripts/esbuild/build.mjs';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const devMode = process.argv[2] === 'dev';

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  banner: {js: apacheLicense()},
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
};

function nodeEsm() {
  return build({
    ...base,
    platform: 'node',
    packages: 'external',
    outfile: 'dist/headless.shopify.esm.js',
    format: 'esm',
  });
}

function browserEsm() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'cdn/headless.shopify.esm.js',
    format: 'esm',
    watch: devMode,
  });
}

async function main() {
  await Promise.all([nodeEsm(), browserEsm()]);
}

main();

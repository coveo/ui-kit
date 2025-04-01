import {umdWrapper} from 'esbuild-plugin-umd-wrapper';
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

function nodeCjs() {
  return build({
    ...base,
    platform: 'node',
    packages: 'external',
    outfile: 'dist/bueno.js',
    format: 'cjs',
  });
}

function nodeEsm() {
  return build({
    ...base,
    platform: 'node',
    packages: 'external',
    outfile: 'dist/bueno.esm.js',
    format: 'esm',
  });
}

function browserEsm() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'cdn/bueno.esm.js',
    format: 'esm',
    watch: devMode,
  });
}

function browserUmd() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'cdn/bueno.js',
    format: 'cjs',
    banner: {
      js: `${base.banner.js}`,
    },
    plugins: [umdWrapper({libraryName: 'Bueno'})],
  });
}

async function main() {
  await Promise.all([nodeCjs(), nodeEsm(), browserEsm(), browserUmd()]);
}

main();

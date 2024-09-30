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
    outfile: 'dist/bueno.js',
    format: 'cjs',
  });
}

function nodeEsm() {
  return build({
    ...base,
    platform: 'node',
    outfile: 'dist/bueno.esm.js',
    format: 'esm',
  });
}

function browserEsm() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'dist/browser/bueno.esm.js',
    format: 'esm',
    watch: devMode,
  });
}

function browserEsmForAtomicDevelopment() {
  const buildAtomic = build({
    ...base,
    platform: 'browser',
    outfile: '../atomic/src/external-builds/bueno.esm.js',
    format: 'esm',
    watch: devMode,
    minify: false,
  });

  const buildHeadless = build({
    ...base,
    platform: 'browser',
    outfile: '../headless/src/external-builds/bueno.esm.js',
    format: 'esm',
    watch: devMode,
    minify: false,
  });

  return Promise.all([buildAtomic, buildHeadless]);
}

function browserUmd() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'dist/browser/bueno.js',
    format: 'cjs',
    banner: {
      js: `${base.banner.js}`,
    },
    plugins: [umdWrapper({libraryName: 'Bueno'})],
  });
}

async function main() {
  await Promise.all([
    nodeCjs(),
    nodeEsm(),
    browserEsm(),
    browserUmd(),
    browserEsmForAtomicDevelopment(),
  ]);
}

main();

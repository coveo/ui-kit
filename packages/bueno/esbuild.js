const {build} = require('esbuild');
const {apacheLicense} = require('../../scripts/license/apache');

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
    minify: true,
    sourcemap: true,
  });
}

async function main() {
  await Promise.all([nodeCjs(), nodeEsm(), browserEsm()]);
}

main();

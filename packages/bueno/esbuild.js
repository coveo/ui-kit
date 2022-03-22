const {build} = require('esbuild');
const {apacheLicense} = require('../../scripts/license/apache');
const {umdFooter} = require('../../scripts/bundle/umd');

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

function browserUmd() {
  const footer = umdFooter('Bueno');

  return build({
    ...base,
    platform: 'browser',
    outfile: 'dist/browser/bueno.js',
    format: 'iife',
    globalName: 'Bueno',
    footer: {
      js: footer.footer,
    },
  });
}

async function main() {
  await Promise.all([nodeCjs(), nodeEsm(), browserEsm(), browserUmd()]);
}

main();

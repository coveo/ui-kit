const {build} = require('esbuild');
const {apacheLicense} = require('../../scripts/license/apache');

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  banner: {js: apacheLicense()},
  tsconfig: './tsconfig.json',
};

function esm() {
  return build({
    ...base,
    outfile: 'dist/index.js',
    format: 'esm',
  });
}

function cjs() {
  return build({
    ...base,
    outfile: 'dist/cjs/index.cjs',
    format: 'cjs',
  });
}

async function main() {
  await Promise.all([esm(), cjs()]);
}

main();

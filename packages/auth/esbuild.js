const {build} = require('esbuild');
const {apacheLicense} = require('../../scripts/license/apache');

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/auth.ts'],
  bundle: true,
  banner: {js: apacheLicense()},
  tsconfig: './src/tsconfig.build.json',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
};

function esm() {
  return build({
    ...base,
    outfile: 'dist/auth.esm.js',
    format: 'esm',
  });
}

function cjs() {
  return build({
    ...base,
    outfile: 'dist/auth.js',
    format: 'cjs',
  });
}

async function main() {
  await Promise.all([esm(), cjs()]);
}

main();

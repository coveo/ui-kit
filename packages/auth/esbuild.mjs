import {build} from '../../scripts/esbuild/build.mjs';
import {apacheLicense} from '../../scripts/license/apache.mjs';

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

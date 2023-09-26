import {context as defineContext} from 'esbuild';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const devMode = process.argv[2] === 'dev';

/**
 * @param {import('esbuild').BuildOptions} options
 * @param {boolean} [watch]
 */
async function build(options, watch = false) {
  const context = await defineContext(options);
  const output = await context.rebuild();
  if (watch) {
    await context.watch();
  }
  await context.dispose();
  return output;
}

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/auth.ts'],
  target: 'es2018',
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

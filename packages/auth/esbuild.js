const {build} = require('esbuild')

function browser() {
  return build({
    entryPoints: ['src/auth.ts'],
    bundle: true,
    outfile: 'dist/browser/auth.js',
    format: 'iife',
    minify: true,
    sourcemap: true,
  });
}

function browserEsm() {
  return build({
    entryPoints: ['src/auth.ts'],
    bundle: true,
    outfile: 'dist/auth.esm.js',
    format: 'esm',
  });
}

async function main() {
  await Promise.all([browser(), browserEsm()]);
}

main();
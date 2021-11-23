const {build} = require('esbuild')

const base = {
  entryPoints: ['src/auth.ts'],
  bundle: true,
}

function browser() {
  return build({
    ...base,
    outfile: 'dist/browser/auth.js',
    format: 'iife',
    minify: true,
    sourcemap: true,
  });
}

function browserEsm() {
  return build({
    ...base,
    outfile: 'dist/auth.esm.js',
    format: 'esm',
  });
}

function node() {
  return build({
    ...base,
    outfile: 'dist/auth.js',
    format: 'cjs',
  });
}

async function main() {
  await Promise.all([browser(), browserEsm(), node()]);
}

main();
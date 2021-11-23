const {build} = require('esbuild')

function browser() {
  return build({
    entryPoints: ['src/auth.ts'],
    bundle: true,
    outfile: 'dist/browser/auth.js',
    minify: true,
    sourcemap: true,
  });
}

async function main() {
  await Promise.all([browser()]);
}

main();
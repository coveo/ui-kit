import {context as defineContext} from 'esbuild';
import {umdWrapper} from '../../scripts/bundle/umd.mjs';
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
 * @satisfies {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/index.ts'],
  target: 'es2018',
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
  return build(
    {
      ...base,
      platform: 'browser',
      outfile: 'dist/browser/bueno.esm.js',
      format: 'esm',
    },
    true
  );
}

function browserUmd() {
  const umd = umdWrapper('Bueno');

  return build({
    ...base,
    platform: 'browser',
    outfile: 'dist/browser/bueno.js',
    format: 'cjs',
    banner: {
      js: `${base.banner.js}\n${umd.header}`,
    },
    footer: {
      js: umd.footer,
    },
  });
}

async function main() {
  await Promise.all([nodeCjs(), nodeEsm(), browserEsm(), browserUmd()]);
}

main();

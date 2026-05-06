// ⚠️  CDN OUTPUT: This build outputs to "cdn/". If you change this path,
// you MUST also update the corresponding "source" field in ui-kit-cd
// (.deployment.config/{commit,dev,prd}.json) and deploy-local-cdn.mjs.
import {umdWrapper} from 'esbuild-plugin-umd-wrapper';
import {build} from '../../scripts/esbuild/build.mjs';
import {apacheLicense} from '../../scripts/license/apache.mjs';

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
    packages: 'external',
    outfile: 'dist/bueno.js',
    format: 'cjs',
  });
}

function nodeEsm() {
  return build({
    ...base,
    platform: 'node',
    packages: 'external',
    outfile: 'dist/bueno.esm.js',
    format: 'esm',
  });
}

function browserEsm() {
  return build({
    ...base,
    platform: 'browser',
    // ⚠️  Changing this filename affects CDN pointer files in ui-kit-cd.
    outfile: 'cdn/bueno.esm.js',
    format: 'esm',
    watch: devMode,
  });
}

function browserUmd() {
  return build({
    ...base,
    platform: 'browser',
    outfile: 'cdn/bueno.js',
    format: 'cjs',
    banner: {
      js: `${base.banner.js}`,
    },
    plugins: [umdWrapper({libraryName: 'Bueno'})],
  });
}

async function main() {
  await Promise.all([nodeCjs(), nodeEsm(), browserEsm(), browserUmd()]);
}

main();

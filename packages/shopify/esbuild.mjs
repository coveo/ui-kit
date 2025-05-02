import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {build} from '../../scripts/esbuild/build.mjs';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname).slice(
  process.platform === 'win32' ? 1 : 0
);

const isDevMode = process.argv[2] === 'dev';
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const isNightly = process.env.IS_NIGHTLY === 'true';

const buenoJsonPath = resolve(__dirname, '../bueno/package.json');
const buenoJson = JSON.parse(readFileSync(buenoJsonPath, 'utf-8'));

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : 'v' + buenoJson.version;
const buenoPath = isCDN
  ? `/bueno/${buenoVersion}/bueno.esm.js`
  : '@coveo/bueno';

/**
 * @type {import('esbuild').BuildOptions}
 */

const entries = [
  {
    entryPoint: 'src/headless/index.ts',
    outfile: 'shopify.headless.esm.js',
  },
  {
    entryPoint: 'src/utils/index.ts',
    outfile: 'shopify.utils.esm.js',
  },
];

const getBase = (entryPoint) => ({
  entryPoints: [entryPoint],
  bundle: true,
  banner: {js: apacheLicense()},
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

function nodeEsm(base, outfile) {
  return build({
    ...base,
    platform: 'node',
    packages: 'external',
    outfile: `dist/${outfile}`,
    format: 'esm',
  });
}

function browserEsm(base, outfile) {
  const replaceBuenoImport = {
    name: 'replace-bueno-import',
    setup(build) {
      build.onResolve({filter: /^@coveo\/bueno$/}, (args) => {
        return {path: buenoPath, external: true};
      });
    },
  };

  return build({
    ...base,
    platform: 'browser',
    outfile: `cdn/${outfile}`,
    format: 'esm',
    watch: isDevMode,
    external: [buenoPath],
    plugins: isCDN ? [replaceBuenoImport] : [],
  });
}

async function main() {
  await Promise.all(
    entries
      .map(async ({entryPoint, outfile}) => {
        const base = getBase(entryPoint);
        return [nodeEsm(base, outfile), browserEsm(base, outfile)];
      })
      .flat()
  );
}

main();

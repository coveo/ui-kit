const path = require('path');
const {readFileSync} = require('fs');
const {build} = require('esbuild');
const alias = require('esbuild-plugin-alias');
const {umdWrapper} = require('../../scripts/bundle/umd');

const devMode = process.argv[2] === 'dev';

const useCaseEntries = {
  search: 'src/index.ts',
  recommendation: 'src/recommendation.index.ts',
  'product-recommendation': 'src/product-recommendation.index.ts',
  'product-listing': 'src/product-listing.index.ts',
  'case-assist': 'src/case-assist.index.ts',
};

function getUmdGlobalName(useCase) {
  const map = {
    search: 'CoveoHeadless',
    recommendation: 'CoveoHeadlessRecommendation',
    'product-recommendation': 'CoveoHeadlessProductRecommendation',
    'product-listing': 'CoveoHeadlessProductListing',
    'case-assist': 'CoveoHeadlessCaseAssist',
  }

  const globalName = map[useCase];

  if (globalName) {
    return globalName;
  }

  throw new Error(`Please specify a global name for the "${useCase}" use-case.`)
}

function getPackageVersion() {
  return JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

function getUseCaseDir(prefix, useCase) {
  return useCase === 'search' ? prefix : `${prefix}/${useCase}`;
}

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  bundle: true,
  tsconfig: './src/tsconfig.build.json',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VERSION': JSON.stringify(getPackageVersion()),
  },
};

const browserEsmForAtomicDevelopment = Object.entries(useCaseEntries).map((entry) => {
  const [useCase, entryPoint] = entry;
  const outDir = getUseCaseDir('../atomic/src/external-builds', useCase);
  const outfile = `${outDir}/headless.esm.js`;

  return buildBrowserConfig({
    entryPoints: [entryPoint],
    outfile,
    format: 'esm',
    watch: devMode,
  });
});

const browserEsm = Object.entries(useCaseEntries).map((entry) => {
  const [useCase, entryPoint] = entry;
  const outDir = getUseCaseDir('dist/browser', useCase);
  const outfile = `${outDir}/headless.esm.js`;

  return buildBrowserConfig({
    entryPoints: [entryPoint],
    outfile,
    format: 'esm',
  });
});

const browserUmd = Object.entries(useCaseEntries).map((entry) => {
  const [useCase, entryPoint] = entry;
  const outDir = getUseCaseDir('dist/browser/', useCase);
  const outfile = `${outDir}/headless.js`;
  
  const globalName = getUmdGlobalName(useCase);
  const umd = umdWrapper(globalName);

  return buildBrowserConfig({
    entryPoints: [entryPoint],
    outfile,
    format: 'cjs',
    banner: {
      js: umd.header
    },
    footer: {
      js: umd.footer
    }, 
  });
});

/**
 * @param {import('esbuild').BuildOptions} options
 * @returns {Promise<import('esbuild').BuildResult>}
 */
function buildBrowserConfig(options) {
  return build({
    ...base,
    platform: 'browser',
    minify: true,
    sourcemap: true,
    plugins: [
      alias({
        'coveo.analytics': path.resolve(
          __dirname,
          './node_modules/coveo.analytics/dist/library.es.js'
        ),
        'cross-fetch': path.resolve(__dirname, './fetch-ponyfill.js'),
        'web-encoding': path.resolve(
          __dirname,
          './node_modules/web-encoding/src/lib.js'
        ),
      }),
    ],
    ...options,
  });
}

const nodeCjs = Object.entries(useCaseEntries).map((entry) => {
  const [useCase, entryPoint] = entry;
  const dir = getUseCaseDir('dist/', useCase);
  const outfile = `${dir}/headless.js`;

  return buildNodeConfig({
    entryPoints: [entryPoint],
    outfile,
    format: 'cjs',
  });
});

const nodeEsm = Object.entries(useCaseEntries).map((entry) => {
  const [useCase, entryPoint] = entry;
  const dir = getUseCaseDir('dist/', useCase);
  const outfile = `${dir}/headless.esm.js`;

  return buildNodeConfig({
    entryPoints: [entryPoint],
    outfile,
    format: 'esm',
  });
});

/**
 * @param {import('esbuild').BuildOptions} options
 * @returns {Promise<import('esbuild').BuildResult>}
 */
function buildNodeConfig(options) {
  return build({
    ...base,
    platform: 'node',
    plugins: [
      alias({
        'coveo.analytics': path.resolve(
          __dirname,
          './node_modules/coveo.analytics/dist/library.js'
        ),
        'web-encoding': path.resolve(
          __dirname,
          './node_modules/web-encoding/src/lib.cjs'
        ),
      }),
    ],
    ...options,
  });
}

async function main() {
  await Promise.all([...browserEsm, ...browserUmd, ...browserEsmForAtomicDevelopment, ...nodeEsm, ...nodeCjs]);
}

main();

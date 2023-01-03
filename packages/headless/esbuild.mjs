import {build} from 'esbuild';
import alias from 'esbuild-plugin-alias';
import {readFileSync, promises} from 'node:fs';
import {resolve} from 'node:path';
import {umdWrapper} from '../../scripts/bundle/umd.mjs';
import {apacheLicense} from '../../scripts/license/apache.mjs';

const devMode = process.argv[2] === 'dev';

const useCaseEntries = {
  search: 'src/index.ts',
  recommendation: 'src/recommendation.index.ts',
  'product-recommendation': 'src/product-recommendation.index.ts',
  'product-listing': 'src/product-listing.index.ts',
  'case-assist': 'src/case-assist.index.ts',
  insight: 'src/insight.index.ts',
};

function getUmdGlobalName(useCase) {
  const map = {
    search: 'CoveoHeadless',
    recommendation: 'CoveoHeadlessRecommendation',
    'product-recommendation': 'CoveoHeadlessProductRecommendation',
    'product-listing': 'CoveoHeadlessProductListing',
    'case-assist': 'CoveoHeadlessCaseAssist',
    insight: 'CoveoHeadlessInsight',
  };

  const globalName = map[useCase];

  if (globalName) {
    return globalName;
  }

  throw new Error(
    `Please specify a global name for the "${useCase}" use-case.`
  );
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
  banner: {js: apacheLicense()},
};

const browserEsmForAtomicDevelopment = Object.entries(useCaseEntries).map(
  (entry) => {
    const [useCase, entryPoint] = entry;
    const outDir = getUseCaseDir('../atomic/src/external-builds', useCase);
    const outfile = `${outDir}/headless.esm.js`;

    return buildBrowserConfig({
      entryPoints: [entryPoint],
      outfile,
      format: 'esm',
      watch: devMode,
      minify: false,
    });
  }
);

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
      js: `${base.banner.js}\n${umd.header}`,
    },
    footer: {
      js: umd.footer,
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
        'coveo.analytics': resolve(
          '..',
          '..',
          'node_modules',
          'coveo.analytics',
          'dist',
          'library.es.js'
        ),
        'cross-fetch': resolve('.', 'fetch-ponyfill.js'),
        'web-encoding': resolve(
          '..',
          '..',
          'node_modules/web-encoding/src/lib.js'
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
        'coveo.analytics': resolve(
          '..',
          '..',
          'node_modules',
          'coveo.analytics',
          'dist',
          'library.js'
        ),
        'web-encoding': resolve(
          '..',
          '..',
          'node_modules',
          'web-encoding',
          'src',
          'lib.cjs'
        ),
      }),
    ],
    ...options,
  });
}

// https://github.com/coveo/ui-kit/issues/1616
function adjustRequireImportsInNodeEsmBundles() {
  const paths = getNodeEsmBundlePaths();

  return paths.map(async (filePath) => {
    const resolvedPath = resolve(filePath);

    const content = await promises.readFile(resolvedPath, {
      encoding: 'utf-8',
    });
    const modified = content.replace(/__require\(/g, 'require(');

    await promises.writeFile(resolvedPath, modified);
  });
}

function getNodeEsmBundlePaths() {
  return Object.entries(useCaseEntries).map((entry) => {
    const [useCase] = entry;
    const dir = getUseCaseDir('dist/', useCase);
    return `${dir}/headless.esm.js`;
  });
}

async function main() {
  await Promise.all([
    ...browserEsm,
    ...browserUmd,
    ...browserEsmForAtomicDevelopment,
    ...nodeEsm,
    ...nodeCjs,
  ]);
  await Promise.all(adjustRequireImportsInNodeEsmBundles());
}

main();

import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import tsPlugin from '@rollup/plugin-typescript';
import replacePlugin from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
import alias from '@rollup/plugin-alias';
import * as path from 'path';
import dts from "rollup-plugin-dts";
import {readFileSync} from 'fs';
import copy from 'rollup-plugin-copy'

const typescript = () => tsPlugin({tsconfig: './src/tsconfig.build.json'});
const isCI = process.env.CI === 'true';
const isProduction = process.env.BUILD === 'production';

/**
 * @returns {string}
 */
function getPackageVersion() {
  return JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

function replace() {
  const env = isProduction ? 'production' : 'development';
  const version = getPackageVersion();
  return replacePlugin({'process.env.NODE_ENV': JSON.stringify(env), 'process.env.VERSION': JSON.stringify(version)});
}

function onWarn(warning, warn) {
  const isCircularDependency = warning.code === 'CIRCULAR_DEPENDENCY';

  if (isCI && isCircularDependency) {
    throw new Error(warning.message);
  }

  warn(warning);
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function matchesFilter(value) {
  const filterIndex = process.argv.indexOf("--filter");
  if (filterIndex === -1) {
    return true;
  }

  const filter = process.argv[filterIndex + 1];
  return value.includes(filter);
}

// Node Bundles

const nodejs = [
  {
    input: 'src/index.ts',
    outDir: 'dist',
  },
  {
    input: 'src/case-assist.index.ts',
    outDir: 'dist/case-assist'
  },
  {
    input: 'src/recommendation.index.ts',
    outDir: 'dist/recommendation'
  },
  {
    input: 'src/product-recommendation.index.ts',
    outDir: 'dist/product-recommendation'
  },
  {
    input: 'src/product-listing.index.ts',
    outDir: 'dist/product-listing'
  },
].filter(b => matchesFilter(b.input)).map(buildNodeConfiguration);

function buildNodeConfiguration({input, outDir}) {
  return {
    input,
    output: [
      {file: `${outDir}/headless.js`, format: 'cjs'},
      {file: `${outDir}/headless.esm.js`, format: 'es'},
    ],
    plugins: [
      resolve({preferBuiltins: true, mainFields: ['main']}),
      json(),
      commonjs({
        // https://github.com/pinojs/pino/issues/688
        ignore: ['pino-pretty'],
      }),
      typescript(),
      replace(),
    ],
    external: [
      'os',
      'https',
      'http',
      'stream',
      'zlib',
      'fs',
      'vm',
      'util',
    ],
    onwarn: onWarn,
  };
}

// Browser Bundles

const browser = [
  {
    input: 'src/index.ts',
    output: [
      buildUmdOutput('dist/browser', 'CoveoHeadless'),
      buildEsmOutput('dist/browser')
    ]
  },
  {
    input: 'src/case-assist.index.ts',
    output: [
      buildUmdOutput('dist/browser/case-assist', 'CoveoHeadlessCaseAssist'),
      buildEsmOutput('dist/browser/case-assist')
    ]
  },
  {
    input: 'src/recommendation.index.ts',
    output: [
      buildUmdOutput('dist/browser/recommendation', 'CoveoHeadlessRecommendation'),
      buildEsmOutput('dist/browser/recommendation')
    ]
  },
  {
    input: 'src/product-recommendation.index.ts',
    output: [
      buildUmdOutput('dist/browser/product-recommendation', 'CoveoHeadlessProductRecommendation'),
      buildEsmOutput('dist/browser/product-recommendation')
    ]
  },
  {
    input: 'src/product-listing.index.ts',
    output: [
      buildUmdOutput('dist/browser/product-listing', 'CoveoHeadlessProductListing'),
      buildEsmOutput('dist/browser/product-listing')
    ]
  },
].filter(b => matchesFilter(b.input)).map(buildBrowserConfiguration);

function buildBrowserConfiguration({input, output}) {
  return {
    input,
    output,
    plugins: [
      alias({
        entries: [
          {
            find: 'coveo.analytics',
            replacement: path.resolve(
              __dirname,
              './node_modules/coveo.analytics/dist/library.es.js'
            ),
          },
          {
            find: 'cross-fetch',
            replacement: path.resolve(__dirname, './fetch-ponyfill.js'),
          },
          {
            find: 'web-encoding',
            replacement: path.resolve(__dirname, './node_modules/web-encoding/src/lib.js'),
          }
        ],
      }),
      resolve({browser: true}),
      commonjs(),
      typescript(),
      replace(),
      isProduction && sizeSnapshot(),
      isProduction && terser(),
      copy({targets: [{ src: 'src/', dest: 'dist/browser/' }]}),
    ],
  }
}

function buildUmdOutput(outDir, name) {
  return {
    file: `${outDir}/headless.js`,
    format: 'umd',
    name,
    ...sourceMapConfig()
  }
}

function buildEsmOutput(outDir) {
  return {
    file: `${outDir}/headless.esm.js`,
    format: 'es',
    ...sourceMapConfig(),
  }
}

function sourceMapConfig() {
  return {
    sourcemap: isProduction,
    sourcemapPathTransform: (relativeSourcePath) => {
      return path.join('dist/browser/', relativeSourcePath)
    }
  }
}

// For Atomic's development purposes only
const dev = [
  {
    input: 'src/index.ts',
    output: [buildEsmOutput('../atomic/src/external-builds')],
  },
  {
    input: 'src/case-assist.index.ts',
    output: [buildEsmOutput('../atomic/src/external-builds/case-assist')],
  },
  {
    input: 'src/recommendation.index.ts',
    output: [buildEsmOutput('../atomic/src/external-builds/recommendation')],
  },
  {
    input: 'src/product-recommendation.index.ts',
    output: [buildEsmOutput('../atomic/src/external-builds/product-recommendation')],
  },
  {
    input: 'src/product-listing.index.ts',
    output: [buildEsmOutput('../atomic/src/external-builds/product-listing')],
  },
].filter(b => matchesFilter(b.input)).map(buildBrowserConfiguration);

// Api-extractor cannot resolve import() types, so we use dts to create a file that api-extractor
// can consume. When the api-extractor limitation is resolved, this step will not be necessary.
// [https://github.com/microsoft/rushstack/issues/1050]
const typeDefinitions = [
  buildTypeDefinitionConfiguration('index.d.ts'),
  buildTypeDefinitionConfiguration('recommendation.index.d.ts'),
  buildTypeDefinitionConfiguration('product-recommendation.index.d.ts'),
  buildTypeDefinitionConfiguration('product-listing.index.d.ts'),
].filter(b => matchesFilter(b.input));

function buildTypeDefinitionConfiguration(entryFileName) {
  return {
    input: `./dist/definitions/${entryFileName}`,
    output: [{file: `temp/${entryFileName}`, format: "es"}],
    plugins: [dts()]
  }
}

const config = isProduction ? [...nodejs, ...typeDefinitions, ...browser] : dev;

export default config;

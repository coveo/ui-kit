import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import tsPlugin from '@rollup/plugin-typescript';
import replacePlugin from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
import alias from '@rollup/plugin-alias';
import * as path from 'path';
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

// Browser Bundles

const browser = [
  {
    input: 'src/index.ts',
    output: [
      buildUmdOutput('dist/browser', 'CoveoHeadless'),
    ]
  },
  {
    input: 'src/case-assist.index.ts',
    output: [
      buildUmdOutput('dist/browser/case-assist', 'CoveoHeadlessCaseAssist'),
    ]
  },
  {
    input: 'src/recommendation.index.ts',
    output: [
      buildUmdOutput('dist/browser/recommendation', 'CoveoHeadlessRecommendation'),
    ]
  },
  {
    input: 'src/product-recommendation.index.ts',
    output: [
      buildUmdOutput('dist/browser/product-recommendation', 'CoveoHeadlessProductRecommendation'),
    ]
  },
  {
    input: 'src/product-listing.index.ts',
    output: [
      buildUmdOutput('dist/browser/product-listing', 'CoveoHeadlessProductListing'),
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
      copySourceFiles(),
    ],
    onwarn: onWarn
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

function copySourceFiles() {
  return copy({
    targets: [
      {
        src: ['src/', '!src/**/*.test.ts', '!src/test/'],
        dest: 'dist/browser/src/',
        expandDirectories: true,
        onlyFiles: true,
      },
    ],
    flatten: false,
  });
}

// For Atomic's local development purposes only
const local = [
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

const config = [];

if (isProduction) {
  config.push(...browser);
}

if (!isCI) {
  config.push(...local)
}

export default config;

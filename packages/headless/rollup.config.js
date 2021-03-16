import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import tsPlugin from '@rollup/plugin-typescript';
import replacePlugin from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
import alias from '@rollup/plugin-alias';
import {resolve as pathResolve} from 'path';
import dts from "rollup-plugin-dts";
import {readFileSync} from 'fs';

const typescript = () => tsPlugin({tsconfig: './src/tsconfig.build.json'});
const isCI = process.env.CI === 'true';
const isProduction = process.env.BUILD === 'production';

/**
 * @returns {{ version: string }}
 */
function getPackageConfiguration() {
  return JSON.parse(readFileSync('package.json', 'utf-8'));
}

function replace() {
  const env = isProduction ? 'production' : 'development';
  const {version} = getPackageConfiguration();
  return replacePlugin({'process.env.NODE_ENV': JSON.stringify(env), 'process.env.VERSION': JSON.stringify(version)});
}

function onWarn(warning, warn) {
  const isCircularDependency = warning.code === 'CIRCULAR_DEPENDENCY';

  if (isCI && isCircularDependency) {
    throw new Error(warning.message);
  }

  warn(warning);
}

const nodeConfig = {
  input: 'src/index.ts',
  output: [
    {file: 'dist/headless.js', format: 'cjs'},
    {file: 'dist/headless.esm.js', format: 'es'},
  ],
  plugins: [
    resolve({modulesOnly: true}),
    commonjs({
      // https://github.com/pinojs/pino/issues/688
      ignore: ['pino-pretty'],
    }),
    typescript(),
    replace(),
  ],
  external: ['cross-fetch'],
  onwarn: onWarn,
};

const browserConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/browser/headless.js',
      format: 'umd',
      name: 'CoveoHeadless',
      sourcemap: isProduction,
    },
    {
      file: 'dist/browser/headless.esm.js',
      format: 'es',
      sourcemap: isProduction,
    },
    // For Atomic's development purposes only
    {file: '../atomic/src/external-builds/headless.esm.js', format: 'es'},
  ],
  plugins: [
    alias({
      entries: [
        {
          find: 'coveo.analytics',
          replacement: pathResolve(
            __dirname,
            './node_modules/coveo.analytics/dist/library.es.js'
          ),
        },
        {
          find: 'cross-fetch',
          replacement: pathResolve(__dirname, './fetch-ponyfill.js'),
        },
      ],
    }),
    resolve({browser: true}),
    commonjs(),
    typescript(),
    replace(),
    isProduction && sizeSnapshot(),
    isProduction && terser(),
  ],
};


// Api-extractor cannot resolve import() types, so we use dts to create a file that api-extractor
// can consume. When the api-extractor limitation is resolved, this step will not be necessary.
// [https://github.com/microsoft/rushstack/issues/1050]
const typeDefinitions = {
  input: "./dist/index.d.ts",
  output: [{file: "temp/headless.d.ts", format: "es"}],
  plugins: [dts()]
}

const config = isProduction ? [nodeConfig, typeDefinitions, browserConfig] : [browserConfig];

export default config;

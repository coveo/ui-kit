import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
import alias from '@rollup/plugin-alias';
import {resolve as pathResolve} from 'path';

const isCI = process.env.CI === 'true';
const isProduction = process.env.BUILD === 'production';

function replace() {
  const env = isProduction ? 'production' : 'development';
  return replacePlugin({'process.env.NODE_ENV': JSON.stringify(env)});
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
    // For development purposes only
    {file: '../atomic/src/external-builds/headless.esm.js', format: 'es'},
  ],
  plugins: [
    resolve({preferBuiltins: true}),
    commonjs(),
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
      sourcemap: true,
    },
    {
      file: 'dist/browser/headless.esm.js',
      format: 'es',
      sourcemap: true,
    },
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
      ],
    }),
    resolve({browser: true}),
    commonjs(),
    typescript(),
    replace(),
    sizeSnapshot(),
    terser(),
  ],
};

const config = isProduction ? [nodeConfig, browserConfig] : [nodeConfig];

export default config;

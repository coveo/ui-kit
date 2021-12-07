import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';
const {apacheLicense} = require('../../scripts/license/apache');

const isCI = process.env.CI === 'true';
const isProduction = process.env.BUILD === 'production';

function replace() {
  const env = isProduction ? 'production' : 'development';
  return replacePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    preventAssignment: true,
  });
}

function onWarn(warning, warn) {
  const isCircularDependency = warning.code === 'CIRCULAR_DEPENDENCY';

  if (isCI && isCircularDependency) {
    throw new Error(warning.message);
  }

  warn(warning);
}

const browserConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/browser/bueno.js',
    format: 'umd',
    name: 'Bueno',
    sourcemap: true,
    banner: apacheLicense,
  },
  plugins: [
    resolve({browser: true}),
    commonjs(),
    typescript(),
    replace(),
    terser(),
  ],
  onwarn: onWarn,
};

const config = isProduction ? [browserConfig] : [];

export default config;

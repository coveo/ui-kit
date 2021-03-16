import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';
import {readFileSync} from 'fs';

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

const config = {
  input: 'src/utils-exports.ts',
  output: [
    {
      file: 'dist/atomic-utils.js',
      format: 'umd',
      name: 'CoveoAtomicUtils',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({browser: true}),
    commonjs(),
    typescript(),
    replace(),
  ],
};

export default [config];

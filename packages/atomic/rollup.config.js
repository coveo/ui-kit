import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';

const isProduction = process.env.BUILD === 'production';

function replace() {
  const env = isProduction ? 'production' : 'development';
  return replacePlugin({'process.env.NODE_ENV': JSON.stringify(env)});
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
  plugins: [resolve({browser: true}), commonjs(), typescript(), replace()],
};

export default [config];

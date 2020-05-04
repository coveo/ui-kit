import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.BUILD === 'production';

function replace() {
  const env = isProduction ? 'production' : 'development';
  return replacePlugin({ 'process.env.NODE_ENV' : JSON.stringify(env) })
}

const nodeConfig = {
  input: 'src/index.ts',
  output: [
    { file: 'dist/headless.js', format: 'cjs' },
    { file: 'dist/headless.esm.js', format: 'es'},
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescript(),
    replace()
  ],
  external: [
    'cross-fetch'
  ]
}

const browserConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/browser/headless.js',
      format: 'umd',
      name: 'CoveoHeadless',
      sourcemap: true
    },
    {
      file: 'dist/browser/headless.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript(),
    replace(),
    terser()
  ]
}

const config = isProduction ? [nodeConfig, browserConfig] : [nodeConfig];

export default config;
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import {terser} from 'rollup-plugin-terser';

const outputIIFE = ({minify}) => ({
  file: `dist/iife/atomic-react${minify ? '.min' : ''}.js`,
  format: 'iife',
  name: 'CoveoAtomicReact',
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@coveo/atomic': 'CoveoAtomic',
    '@coveo/atomic/headless': 'CoveoHeadless'
  },
  plugins: minify ? [terser()] : [],
});

export default {
  input: 'src/index.ts',
  output: [outputIIFE({minify: true}), outputIIFE({minify: false})],
  external: ['react', 'react-dom', '@coveo/atomic', '@coveo/atomic/headless'],
  plugins: [
    nodePolyfills(),
    typescript({tsconfig: 'tsconfig.umd.json'}),
    commonjs(),
    nodeResolve(),
    replace({
      delimiters: ['', ''],
      values: {
        'process.env.NODE_ENV': JSON.stringify('dev'),
        'util.TextEncoder();': 'TextEncoder();',
        "import { defineCustomElements } from '@coveo/atomic/loader';": '',
        'defineCustomElements();': '',
      },
    }),
  ],
};

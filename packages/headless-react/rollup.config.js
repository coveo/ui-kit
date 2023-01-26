import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import {terser} from 'rollup-plugin-terser';

const outputIIFE = ({minify}) => ({
  file: `dist/iife/headless-react${minify ? '.min' : ''}.js`,
  format: 'iife',
  name: 'CoveoHeadlessReact',
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@coveo/headless': 'CoveoHeadless',
  },
  plugins: minify ? [terser()] : [],
});

const plugins = [
  nodePolyfills(),
  typescript({tsconfig: 'tsconfig.iife.json'}),
  commonjs(),
  nodeResolve(),
];

const commonExternal = ['react', 'react-dom', '@coveo/headless'];

export default [
  {
    input: 'src/index.ts',
    output: [outputIIFE({minify: true}), outputIIFE({minify: false})],
    external: commonExternal,
    plugins,
  },
];

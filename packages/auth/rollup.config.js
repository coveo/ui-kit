import tsPlugin from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';

const typescript = (config) =>
  tsPlugin({tsconfig: './src/tsconfig.build.json', ...config});

function node() {
  return {
    input: 'src/auth.ts',
    output: [
      {file: `dist/auth.js`, format: 'cjs'},
      {file: `dist/auth.esm.js`, format: 'es'},
    ],
    plugins: [typescript({sourceMap: false})],
  };
}

function browser() {
  return {
    input: 'src/auth.ts',
    output: [
      {
        file: `dist/browser/auth.js`,
        format: 'iife',
        name: 'CoveoAuth',
        sourcemap: true,
      },
    ],
    plugins: [typescript({sourceMap: true}), terser()],
  };
}

export default [node(), browser()];

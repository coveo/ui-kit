import {Config} from '@stencil/core';
import {postcss} from '@stencil/postcss';
import alias from '@rollup/plugin-alias';
import path from 'path';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';

import tailwind from 'tailwindcss';
import postcssNesting from 'postcss-nested';
import atImport from 'postcss-import';
import focusVisible from 'postcss-focus-visible';
import autoprefixer from 'autoprefixer';
import replacePlugin from '@rollup/plugin-replace';
import mixins from 'postcss-mixins';
import {readFileSync} from 'fs';

const isProduction = process.env.BUILD === 'production';

function getPackageVersion(): string {
  return JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

function replace() {
  const env = isProduction ? 'production' : 'development';
  const version = getPackageVersion();
  return replacePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.VERSION': JSON.stringify(version),
  });
}

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1;

export const config: Config = {
  namespace: 'atomic',
  taskQueue: 'async',
  sourceMap: true,
  globalScript: 'node_modules/focus-visible/dist/focus-visible.min.js',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {src: 'themes'},
        {
          src: '../node_modules/@salesforce-ux/design-system/assets/icons/{doctype,standard}/*.svg',
          dest: 'assets',
        },
      ],
    },
    {
      type: 'docs-json',
      file: './docs/atomic-docs.json',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages', keepDirStructure: false},
        {src: 'themes'},
        {
          src: '../node_modules/@salesforce-ux/design-system/assets/icons/{doctype,standard}/*.svg',
          dest: 'build/assets',
        },
      ],
    },
  ],
  testing: {
    browserArgs: ['--no-sandbox'],
    transform: {
      '^.+\\.html?$': 'html-loader-jest',
      '^.+\\.svg$': './svg.transform.js',
    },
    transformIgnorePatterns: [],
    testPathIgnorePatterns: ['headless'],
  },
  devServer: {
    reloadStrategy: 'pageReload',
  },
  plugins: [
    inlineSvg(),
    postcss({
      plugins: [
        atImport(),
        mixins(),
        tailwind(),
        focusVisible(),
        postcssNesting(),
        autoprefixer(),
      ],
    }),
    replace(),
  ],
  rollupPlugins: {
    before: [
      isDevWatch &&
        alias({
          entries: [
            {
              find: '@coveo/headless/case-assist',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/case-assist/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless/recommendation',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/recommendation/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless/product-recommendation',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/product-recommendation/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/headless.esm.js'
              ),
            },
          ],
        }),
      html({
        include: 'src/templates/**/*.html',
      }),
    ],
  },
};

import {Config} from '@stencil/core';
import {postcss} from '@stencil/postcss';
import alias from '@rollup/plugin-alias';
import path from 'path';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';

import tailwind from 'tailwindcss';
import atImport from 'postcss-import';
import purgecss from '@fullhuman/postcss-purgecss';

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1;

export const config: Config = {
  namespace: 'atomic',
  taskQueue: 'async',
  globalStyle: 'src/global.pcss',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{src: 'pages'}],
    },
  ],
  testing: {
    browserArgs: ['--no-sandbox'],
    transform: {
      '^.+\\.html?$': 'html-loader-jest',
      '^.+\\.svg$': './svg.transform.js',
    },
  },
  devServer: {
    reloadStrategy: 'pageReload',
  },
  plugins: [
    inlineSvg(),
    postcss({
      plugins: [
        atImport(),
        tailwind(),
        purgecss({
          content: [
            './src/**/*.tsx',
            './src/index.html',
            './src/**/*.pcss',
            './src/**/*.css',
          ],
          defaultExtractor: (content) =>
            content.match(/[A-Za-z0-9-_:/]+/g) || [],
        }),
      ],
    }),
  ],
  rollupPlugins: {
    before: [
      isDevWatch &&
        alias({
          entries: [
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

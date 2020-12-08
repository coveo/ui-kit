import {Config} from '@stencil/core';
import {sass} from '@stencil/sass';
import alias from '@rollup/plugin-alias';
import path from 'path';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1;

export const config: Config = {
  namespace: 'atomic',
  taskQueue: 'async',
  globalStyle: 'node_modules/bootstrap/dist/css/bootstrap-grid.css',
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
    sass({
      includePaths: ['src/scss/'],
      injectGlobalPaths: ['src/scss/_global.scss'],
    }),
    inlineSvg(),
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

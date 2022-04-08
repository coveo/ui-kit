import {Config} from '@stencil/core';
// eslint-disable-next-line node/no-unpublished-import
import html from 'rollup-plugin-html';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/style/index.css',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages', keepDirStructure: false},
        {
          src: '../node_modules/@coveo/atomic/dist/atomic',
          dest: 'build/atomic',
        },
      ],
    },
  ],
  devServer: {
    port: 3666,
  },
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
    ],
  },
};

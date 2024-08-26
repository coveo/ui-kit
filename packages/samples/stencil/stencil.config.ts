import {Config} from '@stencil/core';
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
          src: '../../../../node_modules/@coveo/atomic/dist/atomic',
          dest: 'build/atomic',
          keepDirStructure: false,
        },
      ],
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
    ],
  },
};

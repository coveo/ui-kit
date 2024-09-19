import {Config} from '@stencil/core';
import html from 'rollup-plugin-html';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/style/index.css',
  globalScript: 'src/utils/atomic-loader.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages', keepDirStructure: false},
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/assets',
          dest: 'assets',
          keepDirStructure: false,
        },
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/lang',
          dest: 'lang',
          keepDirStructure: false,
        },
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/themes',
          dest: 'themes',
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

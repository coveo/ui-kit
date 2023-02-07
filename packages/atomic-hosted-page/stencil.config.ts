import {Config} from '@stencil/core';

export const config: Config = {
  namespace: 'atomic-hosted-page',
  taskQueue: 'async',
  sourceMap: true,
  outputTargets: [
    {
      type: 'dist',
      collectionDir: null,
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [{src: 'pages', keepDirStructure: false}].filter((n) => n.src),
    },
  ],
};

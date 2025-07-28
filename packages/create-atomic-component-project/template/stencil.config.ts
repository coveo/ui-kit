import {coveoCdnResolve} from '@coveo/create-atomic-rollup-plugin';
import type {Config} from '@stencil/core';
import html from 'rollup-plugin-html';

export const config: Config = {
  namespace: 'my-custom-components',
  globalStyle: 'src/pages/index.css',
  globalScript: 'src/pages/index.ts',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{src: 'pages', keepDirStructure: false}],
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
      // Replace by `coveoNpmResolve()` to bundle Atomic & Headless directly, instead of using the CDN.
      coveoCdnResolve(),
    ],
  },
};

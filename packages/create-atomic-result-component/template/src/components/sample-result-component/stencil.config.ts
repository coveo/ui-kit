import {coveoCdnResolve} from '@coveo/create-atomic-rollup-plugin';
import {Config} from '@stencil/core';
import {string as html} from 'rollup-plugin-string';
export const config: Config = {
  namespace: 'my-custom-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
      dir: './',
    },
    {
      type: 'docs-json',
      file: 'docs/stencil-docs.json',
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: './**/*.html',
      }),
      // Replace by `coveoNpmResolve()` to bundle Atomic & Headless directly, instead of using the CDN.
      coveoCdnResolve(),
    ],
  },
};

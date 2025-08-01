import replace from '@rollup/plugin-replace';
import type {Config} from '@stencil/core';
import {spawnSync} from 'node:child_process';
import dotenvPlugin from 'rollup-plugin-dotenv';
import html from 'rollup-plugin-html';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import {coveoCdnResolve} from '@coveo/create-atomic-rollup-plugin';

// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: '{{project}}',
  globalStyle: 'src/style/index.css',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{src: 'pages', keepDirStructure: false}],
    },
    {
      type: 'dist',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'bundle',
      minify: false,
      includeGlobalScripts: true,
      generateTypeDeclarations: false,
      externalRuntime: false,
    },
  ],
  plugins: [
    dotenvPlugin(),
    replace({
      'process.env.PLATFORM_URL': `'${process.env.PLATFORM_URL}'`,
      'process.env.ORGANIZATION_ID': `'${process.env.ORGANIZATION_ID}'`,
      'process.env.API_KEY': `'${process.env.API_KEY}'`,
    }),
  ],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
      // Replace by `coveoNpmResolve()` to bundle Atomic & Headless directly, instead of using the CDN.
      coveoCdnResolve(),
    ],
    after: [nodePolyfills()],
  },
};

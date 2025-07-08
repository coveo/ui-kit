import {Config} from '@stencil/core';
import dotenvPlugin from 'rollup-plugin-dotenv';
import html from 'rollup-plugin-html';
import replace from '@rollup/plugin-replace';

// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: '{{project}}',
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
          dest: 'atomic',
          keepDirStructure: false,
        },
        {
          src: '../node_modules/@coveo/headless/dist/browser',
          dest: 'headless',
          keepDirStructure: false,
        },
      ],
    },
    {
      type: 'dist',
    },
    {
      type: 'dist-custom-elements-bundle',
      minify: false,
      includeGlobalScripts: true,
      externalRuntime: false,
      inlineDynamicImports: false,
      dir: 'dist/components',
    },
    /*
    If migrating to Stencil v3, the "dist-custom-elements-bundle" output target should be replaced by the following:
    {
      type: "dist-custom-elements",
      customElementsExportBehavior: "bundle",
      minify: false,
      includeGlobalScripts: true,
      generateTypeDeclarations: false,
      externalRuntime: false,
    },
    */
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
    ],
  },
};

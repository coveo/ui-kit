import alias from '@rollup/plugin-alias';
import replacePlugin from '@rollup/plugin-replace';
import {postcss} from '@stencil-community/postcss';
import {angularOutputTarget as angular} from '@stencil/angular-output-target';
import {Config} from '@stencil/core';
import {reactOutputTarget as react} from '@stencil/react-output-target';
import autoprefixer from 'autoprefixer';
import {readFileSync} from 'fs';
import path from 'path';
import focusVisible from 'postcss-focus-visible';
import atImport from 'postcss-import';
import mixins from 'postcss-mixins';
import postcssNesting from 'postcss-nested';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';
import tailwind from 'tailwindcss';
import tailwindNesting from 'tailwindcss/nesting';
import {generateAngularModuleDefinition as angularModule} from './stencil-plugin/atomic-angular-module';

const isProduction = process.env.BUILD === 'production';

function getPackageVersion(): string {
  return JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

function replaceHeadlessMap() {
  return {
    name: 'replace-map-for-headless-dev',
    generateBundle: (options, bundle) => {
      const headlessBundle = Object.keys(bundle).find(
        (bundle) => bundle.indexOf('headless.esm') !== -1
      );
      if (!headlessBundle) {
        return;
      }

      bundle[headlessBundle].map = null;

      bundle[headlessBundle].code +=
        '//# sourceMappingURL=./headless/headless.esm.js.map';
      return bundle;
    },
  };
}

function replace() {
  const env = isProduction ? 'production' : 'development';
  const version = getPackageVersion();
  return replacePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.VERSION': JSON.stringify(version),
    preventAssignment: true,
  });
}

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1;

export const config: Config = {
  namespace: 'atomic',
  taskQueue: 'async',
  sourceMap: true,
  outputTargets: [
    react({
      componentCorePackage: '@coveo/atomic',
      proxiesFile: '../atomic-react/src/components/stencil-generated/index.ts',
      includeDefineCustomElements: true,
      excludeComponents: [
        'atomic-result-template',
        'atomic-recs-result-template',
        'atomic-field-condition',
      ],
    }),
    angular({
      componentCorePackage: '@coveo/atomic',
      directivesProxyFile:
        '../atomic-angular/projects/atomic-angular/src/lib/stencil-generated/components.ts',
    }),
    angularModule({
      moduleFile:
        '../atomic-angular/projects/atomic-angular/src/lib/stencil-generated/atomic-angular.module.ts',
    }),
    {
      type: 'dist-custom-elements',
      generateTypeDeclarations: false,
    },
    {
      type: 'dist',
      collectionDir: null,
      esmLoaderPath: '../loader',
      copy: [
        {src: 'themes'},
        {
          src: '../../../node_modules/@salesforce-ux/design-system/assets/icons/{doctype,standard}/*.svg',
          dest: 'assets',
        },
      ],
    },
    {
      type: 'docs-json',
      file: './docs/atomic-docs.json',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service worker
      copy: [
        {src: 'pages', keepDirStructure: false},
        {src: 'themes'},
        isDevWatch
          ? {src: 'external-builds', dest: 'build/headless'}
          : {src: ''},
        {
          src: '../../../node_modules/@salesforce-ux/design-system/assets/icons/{doctype,standard}/*.svg',
          dest: 'build/assets',
        },
      ].filter((n) => n.src),
    },
  ],
  testing: {
    browserArgs: ['--no-sandbox'],
    transform: {
      '^.+\\.html?$': 'html-loader-jest',
      '^.+\\.svg$': './svg.transform.js',
    },
    transformIgnorePatterns: [],
    testPathIgnorePatterns: ['.snap'],
    setupFiles: ['./jest/setup.js', 'jest-localstorage-mock'],
    resetMocks: false,
  },
  devServer: {
    reloadStrategy: 'pageReload',
  },
  plugins: [
    // https://github.com/fabriciomendonca/stencil-inline-svg/issues/16
    inlineSvg(),
    postcss({
      plugins: [
        atImport(),
        mixins(),
        tailwindNesting(),
        tailwind(),
        focusVisible(),
        postcssNesting(),
        autoprefixer(),
      ],
    }),
    replace(),
  ],
  rollupPlugins: {
    before: [
      isDevWatch &&
        alias({
          entries: [
            {
              find: '@coveo/headless/case-assist',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/case-assist/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless/recommendation',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/recommendation/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless/product-recommendation',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/product-recommendation/headless.esm.js'
              ),
            },
            {
              find: '@coveo/headless/insight',
              replacement: path.resolve(
                __dirname,
                './src/external-builds/insight/headless.esm.js'
              ),
            },
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
      isDevWatch && replaceHeadlessMap(),
    ],
  },
  extras: {
    enableImportInjection: true,
  },
};

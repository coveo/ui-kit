import replaceWithASTPlugin from '@coveo/rollup-plugin-replace-with-ast';
import alias from '@rollup/plugin-alias';
import replacePlugin from '@rollup/plugin-replace';
import {postcss} from '@stencil-community/postcss';
import {angularOutputTarget as angular} from '@stencil/angular-output-target';
import {Config} from '@stencil/core';
import {reactOutputTarget as react} from '@stencil/react-output-target';
import autoprefixer from 'autoprefixer';
import {readFileSync, readdirSync} from 'fs';
import path from 'path';
import focusVisible from 'postcss-focus-visible';
import atImport from 'postcss-import';
import postcssMap from 'postcss-map';
import mixins from 'postcss-mixins';
import postcssNesting from 'postcss-nested';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';
import tailwind from 'tailwindcss';
import tailwindNesting from 'tailwindcss/nesting';
import headlessJson from '../../packages/headless/package.json';
import {generateAngularModuleDefinition as angularModule} from './stencil-plugin/atomic-angular-module';

const isProduction = process.env.BUILD === 'production';
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

let headlessVersion: string;

if (isCDN) {
  console.log('Building for CDN');
  headlessVersion = 'v' + headlessJson.version;
}

const packageMappings: {[key: string]: {devWatch: string; cdn: string}} = {
  '@coveo/headless/commerce': {
    devWatch: path.resolve(
      __dirname,
      './src/external-builds/commerce/headless.esm.js'
    ),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/commerce/headless.esm.js`,
  },
  '@coveo/headless/insight': {
    devWatch: path.resolve(
      __dirname,
      './src/external-builds/insight/headless.esm.js'
    ),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/insight/headless.esm.js`,
  },
  '@coveo/headless/product-recommendation': {
    devWatch: path.resolve(
      __dirname,
      './src/external-builds/product-recommendation/headless.esm.js'
    ),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/product-recommendation/headless.esm.js`,
  },
  '@coveo/headless/recommendation': {
    devWatch: path.resolve(
      __dirname,
      './src/external-builds/recommendation/headless.esm.js'
    ),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/recommendation/headless.esm.js`,
  },
  '@coveo/headless/case-assist': {
    devWatch: path.resolve(
      __dirname,
      './src/external-builds/case-assist/headless.esm.js'
    ),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/case-assist/headless.esm.js`,
  },
  '@coveo/headless': {
    devWatch: path.resolve(__dirname, './src/external-builds/headless.esm.js'),
    cdn: `https://static.cloud.coveo.com/headless/${headlessVersion}/headless.esm.js`,
  },
  /*   '@coveo/bueno': {
    devWatch: path.resolve(__dirname, './src/external-builds/bueno.esm.js'),
    cdn: `https://static.cloud.coveo.com/bueno/${headlessVersion}/bueno.esm.js`,
  }, */
};

function generateAliasEntries() {
  return Object.entries(packageMappings).map(([find, paths]) => ({
    find,
    replacement: paths.devWatch,
  }));
}

function generateReplaceValues(): {[key: string]: string} {
  return Object.entries(packageMappings).reduce(
    (acc: {[key: string]: string}, [find, paths]) => {
      acc[find] = paths.cdn;
      return acc;
    },
    {}
  );
}
function filterComponentsByUseCaseForReactOutput(useCasePath: string) {
  return readdirSync(useCasePath, {
    recursive: true,
  })
    .map((fileName) => /(atomic-[a-z-]+)\.tsx$/.exec(fileName.toString()))
    .filter((m) => m !== null)
    .flatMap((m) => m![1]);
}
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
    values: {
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.VERSION': JSON.stringify(version),
    },
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
      proxiesFile:
        '../atomic-react/src/components/stencil-generated/search/index.ts',
      includeDefineCustomElements: true,
      excludeComponents: [
        'atomic-result-template',
        'atomic-recs-result-template',
        'atomic-field-condition',
      ].concat(
        filterComponentsByUseCaseForReactOutput('src/components/commerce')
      ),
    }),
    react({
      componentCorePackage: '@coveo/atomic',
      proxiesFile:
        '../atomic-react/src/components/stencil-generated/commerce/index.ts',
      includeDefineCustomElements: true,
      excludeComponents: [
        'atomic-product-template',
        'atomic-recs-result-template',
        'atomic-field-condition',
      ].concat(
        filterComponentsByUseCaseForReactOutput('src/components/search'),
        filterComponentsByUseCaseForReactOutput(
          'src/components/recommendations'
        )
      ),
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
        postcssMap({
          maps: [
            'src/components/common/template-system/post-css-map-for-sections.yaml',
          ],
        }),
        mixins(),
        tailwindNesting(),
        tailwind(),
        focusVisible(),
        postcssNesting(),
        autoprefixer(),
      ],
    }),
    replace(),
    isCDN &&
      replaceWithASTPlugin({
        replacements: generateReplaceValues(),
      }),
  ],
  rollupPlugins: {
    before: [
      isDevWatch &&
        alias({
          entries: generateAliasEntries(),
        }),
      html({
        include: 'src/templates/**/*.html',
      }),
      isDevWatch && replaceHeadlessMap(),
      externalizeDependenciesPlugin(),
    ],
  },
  extras: {
    enableImportInjection: true,
  },
};

function externalizeDependenciesPlugin() {
  return {
    name: 'externalize-dependencies',
    resolveId(source: string) {
      // Externalize @coveo/headless and @coveo/bueno
      if (/^@coveo\/(headless)/.test(source)) {
        return false;
      }
      return null;
    },
  };
}

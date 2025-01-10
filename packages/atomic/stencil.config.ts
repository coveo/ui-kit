import alias from '@rollup/plugin-alias';
import replacePlugin from '@rollup/plugin-replace';
import {postcss} from '@stencil-community/postcss';
import {angularOutputTarget as angular} from '@stencil/angular-output-target';
import {Config} from '@stencil/core';
import {reactOutputTarget as react} from '@stencil/react-output-target';
import autoprefixer from 'autoprefixer';
import {readFileSync, readdirSync} from 'fs';
import focusVisible from 'postcss-focus-visible';
import atImport from 'postcss-import';
import postcssMap from 'postcss-map';
import mixins from 'postcss-mixins';
import postcssNesting from 'postcss-nested';
import {PluginImpl} from 'rollup';
import html from 'rollup-plugin-html';
import {inlineSvg} from 'stencil-inline-svg';
import tailwind from 'tailwindcss';
import tailwindNesting from 'tailwindcss/nesting';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings';
import {generateAngularModuleDefinition as angularModule} from './stencil-plugin/atomic-angular-module';

const isProduction = process.env.BUILD === 'production';
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const packageMappings = generateExternalPackageMappings(__dirname);

function generateAliasEntries() {
  return Object.entries(packageMappings).map(([find, paths]) => ({
    find,
    replacement: paths.devWatch,
  }));
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

const externalizeDependenciesPlugin: PluginImpl = () => {
  return {
    name: 'externalize-dependencies',
    resolveId: (source, _importer, _options) => {
      const packageMapping = packageMappings[source];

      if (packageMapping) {
        if (!isCDN) {
          return false;
        }

        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }

      return null;
    },
  };
};

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1;

export const config: Config = {
  tsconfig: 'tsconfig.stencil.json',
  namespace: 'atomic',
  taskQueue: 'async',
  sourceMap: true,
  outputTargets: [
    !isDevWatch &&
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
    !isDevWatch &&
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
      esmLoaderPath: './atomic/loader',
      collectionDir: null,
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
  ].filter(Boolean),
  testing: {
    browserArgs: ['--no-sandbox'],
    transform: {
      '^.+\\.html?$': 'html-loader-jest',
      '^.+\\.svg$': './svg.transform.cjs',
    },
    transformIgnorePatterns: [],
    testPathIgnorePatterns: ['.snap'],
    setupFiles: ['./jest/setup.cjs', 'jest-localstorage-mock'],
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

import {readdirSync, readFileSync} from 'node:fs';
import replacePlugin from '@rollup/plugin-replace';
import {angularOutputTarget as angular} from '@stencil/angular-output-target';
import type {Config} from '@stencil/core';
import {reactOutputTarget as react} from '@stencil/react-output-target';
import {postcss} from '@stencil-community/postcss';
import tailwindcss from '@tailwindcss/postcss';
import postcssNested from 'postcss-nested';
import type {PluginImpl} from 'rollup';
import {inlineSvg} from 'stencil-inline-svg';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';
import {generateAngularModuleDefinition as angularModule} from './stencil-plugin/atomic-angular-module';

const isProduction = process.env.BUILD === 'production';
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const packageMappings = generateExternalPackageMappings(__dirname);

function filterComponentsByUseCaseForReactOutput(useCasePath: string) {
  return readdirSync(useCasePath, {
    recursive: true,
  })
    .toSorted() // Sort the filenames to ensure deterministic output
    .map((fileName) => /(atomic-[a-z-]+)\.tsx$/.exec(fileName.toString()))
    .filter((m) => m !== null)
    .flatMap((m) => m![1]);
}
function getPackageVersion(): string {
  return JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

function replace() {
  const env = isProduction ? 'production' : 'development';
  const version = getPackageVersion();
  return replacePlugin({
    values: {
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.VERSION': JSON.stringify(version),
      'import.meta.env?.RESOURCE_URL': isCDN ? 'import.meta.url' : 'undefined',
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
        return false;
      }

      return null;
    },
  };
};

const isDevWatch: boolean =
  process.argv &&
  process.argv.indexOf('--dev') > -1 &&
  process.argv.indexOf('--watch') > -1 &&
  process.env.IS_DEV === 'true';

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
          'atomic-result-children',
          'atomic-result-children-template',
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
    !isDevWatch &&
      angular({
        componentCorePackage: '@coveo/atomic',
        directivesProxyFile:
          '../atomic-angular/projects/atomic-angular/src/lib/stencil-generated/components.ts',
      }),
    !isDevWatch &&
      angularModule({
        moduleFile:
          '../atomic-angular/projects/atomic-angular/src/lib/stencil-generated/atomic-angular.module.ts',
      }),
    {
      type: 'dist-custom-elements',
      generateTypeDeclarations: false,
      dir: 'dist/atomic/components',
      customElementsExportBehavior: 'single-export-module',
    },
    {
      type: 'dist',
      esmLoaderPath: './atomic/loader',
      collectionDir: null,
    },
    {
      type: 'docs-json',
      file: './docs/atomic-docs.json',
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
      plugins: [postcssNested(), tailwindcss()],
    }),
    replace(),
  ],
  rollupPlugins: {
    before: [externalizeDependenciesPlugin()],
  },
  extras: {
    enableImportInjection: true,
  },
};

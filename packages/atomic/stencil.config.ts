import {readFileSync} from 'node:fs';
import replacePlugin from '@rollup/plugin-replace';
import type {Config} from '@stencil/core';
import {postcss} from '@stencil-community/postcss';
import tailwindcss from '@tailwindcss/postcss';
import postcssNested from 'postcss-nested';
import type {PluginImpl} from 'rollup';
import {inlineSvg} from 'stencil-inline-svg';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';

const isProduction = process.env.BUILD === 'production';
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const packageMappings = generateExternalPackageMappings(__dirname);

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

export const config: Config = {
  tsconfig: 'tsconfig.stencil.json',
  namespace: 'atomic',
  taskQueue: 'async',
  sourceMap: true,
  outputTargets: [
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
  ],
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

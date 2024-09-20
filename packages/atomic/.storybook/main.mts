import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type {StorybookConfig} from '@storybook/web-components-vite';
import path from 'node:path';
import {mergeConfig} from 'vite';
import headlessJson from '../../../packages/headless/package.json';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const config: StorybookConfig = {
  stories: ['../src/**/*.new.stories.@(js|jsx|ts|tsx|mdx)'],
  staticDirs: [
    {from: '../dist/atomic', to: './assets'},
    {from: '../dist/atomic/lang', to: './lang'},
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@whitespace/storybook-addon-html',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },

  viteFinal: async (config, {configType}) =>
    mergeConfig(config, {
      plugins: [
        nxViteTsPaths(),
        resolveStorybookUtils(),
        configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
      ],
    }),
};

function resolveStorybookUtils() {
  return {
    name: 'resolve-storybook-utils',
    async resolveId(source: string, importer: unknown, options: unknown) {
      if (source.startsWith('@coveo/atomic-storybook-utils')) {
        return this.resolve(
          source.replace(
            '@coveo/atomic-storybook-utils',
            path.resolve(__dirname, '../storybookUtils')
          ),
          importer,
          options
        );
      }
    },
  };
}

function externalizeDependencies() {
  return {
    name: 'externalize-dependencies',
    enforce: 'pre',
    resolveId: (id: string) => {
      if (id.startsWith('/headless')) {
        return false;
      }
      if (packageMappings[id]) {
        if (!isCDN) {
          return false;
        }

        return {
          id: packageMappings[id].cdn,
          external: 'absolute',
        };
      }
    },
  };
}

let headlessVersion: string;
if (isCDN) {
  console.log('Building for CDN');
  headlessVersion = 'v' + headlessJson.version;
}

const packageMappings: {[key: string]: {devWatch: string; cdn: string}} = {
  '@coveo/headless/commerce': {
    devWatch: path.resolve(
      __dirname,
      '../src/external-builds/commerce/headless.esm.js'
    ),
    cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
  },
  '@coveo/headless/insight': {
    devWatch: path.resolve(
      __dirname,
      '../src/external-builds/insight/headless.esm.js'
    ),
    cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
  },
  '@coveo/headless/product-recommendation': {
    devWatch: path.resolve(
      __dirname,
      '../src/external-builds/product-recommendation/headless.esm.js'
    ),
    cdn: `/headless/${headlessVersion}/product-recommendation/headless.esm.js`,
  },
  '@coveo/headless/recommendation': {
    devWatch: path.resolve(
      __dirname,
      '../src/external-builds/recommendation/headless.esm.js'
    ),
    cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
  },
  '@coveo/headless/case-assist': {
    devWatch: path.resolve(
      __dirname,
      '../src/external-builds/case-assist/headless.esm.js'
    ),
    cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
  },
  '@coveo/headless': {
    devWatch: path.resolve(__dirname, '../src/external-builds/headless.esm.js'),
    cdn: `/headless/${headlessVersion}/headless.esm.js`,
  },
  /*   '@coveo/bueno': {
    devWatch: path.resolve(__dirname, './src/external-builds/bueno.esm.js'),
    cdn: `/bueno/${headlessVersion}/bueno.esm.js`,
  }, */
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs

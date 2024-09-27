import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type {StorybookConfig} from '@storybook/web-components-vite';
import path from 'path';
import {PluginImpl} from 'rollup';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings';

const externalizeDependencies: PluginImpl = () => {
  return {
    name: 'externalize-dependencies',
    enforce: 'pre',
    resolveId(source, _importer, _options) {
      if (/^\/(headless|bueno)/.test(source)) {
        return false;
      }

      const packageMappings = generateExternalPackageMappings(__dirname);
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

const resolveStorybookUtils: PluginImpl = () => {
  return {
    name: 'resolve-storybook-utils',
    async resolveId(source: string, importer, options) {
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
};

export default config;

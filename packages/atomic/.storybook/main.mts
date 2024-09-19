import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type {StorybookConfig} from '@storybook/web-components-vite';
import {mergeConfig} from 'vite';
import {packageMappings} from '../scripts/packageMappings';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const config: StorybookConfig = {
  stories: ['../src/**/*.new.stories.@(js|jsx|ts|tsx|mdx)'],
  staticDirs: [{from: '../dist/atomic', to: './assets'}],
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
        configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
      ],
    }),
};

function externalizeDependencies() {
  return {
    name: 'externalize-dependencies',
    enforce: 'pre',
    resolveId: (id: string) => {
      if (/^\/(headless|bueno)/.test(id)) {
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

export default config;

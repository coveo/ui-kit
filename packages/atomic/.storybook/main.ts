import type {StorybookConfig} from '@storybook/web-components-vite';
import type {PluginImpl} from 'rollup';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';
import base from './vite.config';

const externalizeDependencies: PluginImpl = () => {
  return {
    name: 'externalize-dependencies',
    enforce: 'pre',
    resolveId(source, _importer, _options) {
      if (/^\/(headless|bueno)/.test(source)) {
        return false;
      }

      if (
        /(.*)(\/|\\)+(bueno|headless)\/v\d+\.\d+\.\d+(-nightly)?(\/|\\).*/.test(
          source
        )
      ) {
        return false;
      }

      const packageMappings = generateExternalPackageMappings();
      //TODO: Fix types
      // @ts-ignore
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
  stories: [
    './Introduction.stories.tsx',
    '../src/**/*.new.stories.tsx',
    '../src/**/*.mdx',
    '../storybook-pages/**/*.new.stories.tsx',
    '../storybook-pages/**/*.mdx',
  ],
  staticDirs: [
    {from: '../dist/atomic/assets', to: '/assets'},
    {from: '../dist/atomic/lang', to: '/lang'},
    {from: '../dist/atomic', to: './assets'},
    {from: '../dist/atomic/lang', to: './lang'},
    {from: './public', to: '/'},
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },

  async viteFinal(config, {configType}) {
    const {default: tailwindcss} = await import('@tailwindcss/vite');
    return mergeConfig(
      config,
      mergeConfig(base, {
        plugins: [
          tailwindcss(),
          configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
        ],
      })
    );
  },
};

export default config;

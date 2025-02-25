import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type {StorybookConfig} from '@storybook/web-components-vite';
import path from 'path';
import {PluginImpl} from 'rollup';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';

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
  stories: ['../src/**/*.new.stories.tsx', '../src/**/*.mdx'],
  staticDirs: [
    {from: '../dist/atomic/assets', to: '/assets'},
    {from: '../dist/atomic/lang', to: '/lang'},
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
        resolvePathAliases(),
        forceInlineCssImports(),
        configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
      ],
    }),
};

const resolvePathAliases: PluginImpl = () => {
  return {
    name: 'resolve-path-aliases',
    async resolveId(source: string, importer, options) {
      if (source.startsWith('@/')) {
        const aliasPath = source.slice(2); // Remove the "@/" prefix
        const resolvedPath = path.resolve(__dirname, `../${aliasPath}`);

        return this.resolve(resolvedPath, importer, options);
      }
    },
  };
};

const forceInlineCssImports: PluginImpl = () => {
  return {
    name: 'force-inline-css-imports',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return {
          code: code.replace(
            /import\s+([^'"]+)\s+from\s+['"]([^'"]+\.css)['"]/g,
            (_, importName, cssPath) =>
              `import ${importName} from '${cssPath}?inline'`
          ),
          map: null,
        };
      }
      return null;
    },
  };
};

export default config;

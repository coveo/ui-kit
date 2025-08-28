import {readFileSync} from 'node:fs';
import path, {dirname, resolve} from 'node:path';
import type {StorybookConfig} from '@storybook/web-components-vite';
import type {PluginImpl} from 'rollup';
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

      const packageMappings = generateExternalPackageMappings();
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
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },

  async viteFinal(config, {configType}) {
    const {default: tailwindcss} = await import('@tailwindcss/vite');
    return mergeConfig(config, {
      plugins: [
        tailwindcss(),
        resolvePathAliases(),
        forceInlineCssImports(),
        svgTransform(),
        configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
      ],
    });
  },
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

const svgTransform: PluginImpl = () => {
  return {
    name: 'svg-transform',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return code.replace(
          /import\s+([a-zA-Z]+)\s+from\s+['"]([^'"]+\.svg)['"]/g,
          (_, importName, importPath) => {
            const svgContent = readFileSync(
              resolve(dirname(id), importPath),
              'utf8'
            ).replace(/'/g, "\\'");
            return `const ${importName} = '${svgContent}';`;
          }
        );
      }
      return null;
    },
  };
};

export default config;

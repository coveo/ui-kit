import {readFileSync} from 'node:fs';
import path, {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {StorybookConfig} from '@storybook/web-components-vite';
import type {PluginImpl} from 'rollup';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const virtualOpenApiModules: PluginImpl = () => {
  const virtualModules = new Map<string, string>();

  return {
    name: 'virtual-openapi-modules',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('virtual:open-api-coveo')) {
        return id;
      }
      return null;
    },
    async load(id) {
      if (id.startsWith('virtual:open-api-coveo')) {
        const url = id.replace(
          'virtual:open-api-coveo',
          'https://platform.cloud.coveo.com/api-docs'
        );
        if (virtualModules.has(id)) {
          return virtualModules.get(id);
        }

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
          }
          const content = await response.json();
          const moduleContent = `export default ${JSON.stringify(content, null, 2)};`;
          virtualModules.set(id, moduleContent);
          return moduleContent;
        } catch (error) {
          console.error(`Error fetching OpenAPI spec from ${url}:`, error);
          throw error;
        }
      }
      return null;
    },
  };
};

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

function getPackageVersion(): string {
  return JSON.parse(
    readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
  ).version;
}

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
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  env: (config) => ({
    ...config,
    VITE_IS_CDN: isCDN ? 'true' : 'false',
  }),
  async viteFinal(config, {configType}) {
    const {default: tailwindcss} = await import('@tailwindcss/vite');
    const version = getPackageVersion();

    return mergeConfig(config, {
      define: {
        'process.env.VERSION': JSON.stringify(version),
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
      plugins: [
        virtualOpenApiModules(),
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

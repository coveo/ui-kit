import {readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {StorybookConfig} from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import type {Plugin} from 'vite';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';
import {atomicSourceTransformPlugins} from '../scripts/vite-source-plugins.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isVitest = process.env.VITEST !== undefined;
const isChromatic = process.env.STORYBOOK_INVOKED_BY === 'chromatic';
const isPlaywright = process.env.STORYBOOK_INVOKED_BY === 'playwright';

const virtualOpenApiModules = (): Plugin => {
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

const externalizeDependencies = (configType: 'DEVELOPMENT' | 'PRODUCTION' | undefined): Plugin => {
  const packageMappings: Record<string, {cdn?: string; local: string}> =
    generateExternalPackageMappings();
  return {
    name: 'externalize-dependencies',
    enforce: 'pre',
    resolveId(source, _importer, _options) {
      if (/^\/(headless|bueno)/.test(source)) {
        return false;
      }

      if (/(.*)(\/|\\)+(bueno|headless)\/v\d+\.\d+\.\d+(-nightly)?(\/|\\).*/.test(source)) {
        return false;
      }

      const packageMapping = packageMappings[source];

      if (!packageMapping) {
        // If the package isn't in our mapping, we assume it's a local dependency and leave it as-is
        return null;
      }

      // For most testing, we want to use the local versions of all packages to ensure everything is properly bundled together for testing
      if (isVitest || isPlaywright) {
        return null;
      }

      // For local Storybook development, we want to use local packages source to allow for easier debugging and HMR.
      // We also want to use local packages for Chromatic builds so TurboSnap can resolve changes in Atomic dependencies.
      if (configType === 'DEVELOPMENT' || isChromatic) {
        return {
          id: packageMapping.local,
        };
      }

      if (!packageMapping.cdn) {
        return null;
      }

      // For production Storybook builds, we want to use Domain-relative URL to use the CDN versions of the packages.
      return {
        id: packageMapping.cdn,
        external: 'absolute',
      };
    },
  };
};

function getPackageVersion(): string {
  return JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8')).version;
}

const config: StorybookConfig = {
  stories: [
    './Introduction.mdx',
    './Crawling.stories.tsx',
    '../src/**/*.new.stories.tsx',
    '../src/**/!(*.usage).mdx',
    '../storybook-pages/**/*.new.stories.tsx',
    '../storybook-pages/**/*.mdx',
  ],
  staticDirs: [
    {from: '../dist/assets', to: '/assets'},
    {from: '../src/assets/lang', to: '/assets/lang'},
    {from: '../src/assets/lang', to: '/lang'},
    {from: './public', to: '/'},
  ],
  addons: [
    '@storybook/addon-a11y',
    'storybook-addon-pseudo-states',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  async viteFinal(config, {configType}) {
    const {default: tailwindcss} = await import('@tailwindcss/vite');
    const version = getPackageVersion();

    return mergeConfig(config, {
      define: {
        'process.env.VERSION': JSON.stringify(version),
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
      resolve: {
        alias: [
          {
            find: /^coveo\.analytics$/,
            replacement: createRequire(import.meta.url).resolve('coveo.analytics/dist/browser.mjs'),
          },
        ],
      },
      optimizeDeps: {
        include: [
          'dayjs',
          'dayjs/plugin/quarterOfYear.js',
          'dayjs/plugin/customParseFormat.js',
          'dayjs/plugin/timezone.js',
          'dayjs/plugin/utc.js',
        ],
      },
      plugins: [
        ...atomicSourceTransformPlugins(),
        virtualOpenApiModules(),
        tailwindcss(),
        markComponentImportsAsSideEffectful(configType),
        virtualAssetsList(),
        externalizeDependencies(configType),
      ],
    });
  },
};

const virtualAssetsList = (): Plugin => {
  let cachedModule: string | null = null;
  return {
    name: 'virtual-assets-list',
    resolveId(id) {
      if (id === 'virtual:assets-list') {
        return id;
      }
      return null;
    },
    load(id) {
      if (id === 'virtual:assets-list') {
        if (!cachedModule) {
          const assetsDir = resolve(__dirname, '../dist/assets');
          cachedModule = `export default ${JSON.stringify({assets: readdirSync(assetsDir).sort()})};`;
        }
        return cachedModule;
      }
    },
  };
};

export default config;
function markComponentImportsAsSideEffectful(
  configType: 'DEVELOPMENT' | 'PRODUCTION' | undefined
): Plugin {
  const absolutePathToRoot = resolve(__dirname, '..');
  return {
    name: 'mark-components-as-side-effectful',
    enforce: 'pre',
    async resolveId(id, source, options) {
      if (
        source?.startsWith(absolutePathToRoot) &&
        (id.startsWith('.') || id.startsWith(absolutePathToRoot))
      ) {
        const filePathRelativeToRoot = relative(absolutePathToRoot, resolve(dirname(source), id));
        if (filePathRelativeToRoot.match(/^src\/components\/\w*\/([\w-]*)\/\1(\.js)?$/)) {
          const resolution = await this.resolve(id, source, options);

          if (configType === 'PRODUCTION' && !isChromatic) {
            // Drop component imports for CDN builds by resolving to virtual empty module
            return {
              id: `\0virtual-empty:${resolution!.id}`,
              moduleSideEffects: false,
            };
          }

          return {id: resolution!.id, moduleSideEffects: true};
        }
      }
      return null;
    },
    load(id) {
      if (configType === 'PRODUCTION' && !isChromatic && id.startsWith('\0virtual-empty:')) {
        // Return empty exports for stubbed components
        return 'export default {};';
      }
      return null;
    },
  };
}

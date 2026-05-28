import {readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path, {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {StorybookConfig} from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import type {Plugin} from 'vite';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isVitest = process.env.VITEST !== undefined;
const isChromatic = process.env.IS_CHROMATIC === 'true';

const virtualCustomElementTags = (): Plugin => {
  return {
    name: 'virtual-custom-element-tags',
    enforce: 'pre',
    resolveId(id, importer) {
      if (
        importer &&
        resolve(dirname(importer), id) ===
          resolve(import.meta.dirname, '../src/utils/custom-element-tags.js')
      ) {
        return `virtual:custom-element-tags`;
      }
      return null;
    },
    async load(id) {
      if (id === 'virtual:custom-element-tags') {
        return `
          import elementMap from '@/src/components/lazy-index.js';
          export const ATOMIC_CUSTOM_ELEMENT_TAGS = new Set(Object.keys(elementMap));
        `;
      }
      return null;
    },
  };
};

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

const externalizeDependencies = (
  configType: 'DEVELOPMENT' | 'PRODUCTION' | undefined
): Plugin => {
  const packageMappings: Record<string, {cdn: string; local: string}> =
    generateExternalPackageMappings();
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

      const packageMapping = packageMappings[source];

      if (!packageMapping || isVitest || isChromatic()) {
        return null;
      }

      if (configType === 'DEVELOPMENT') {
        return {
          id: packageMapping.local,
        };
      } else {
        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }
    },
  };
};

function getPackageVersion(): string {
  return JSON.parse(
    readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
  ).version;
}

const config: StorybookConfig = {
  stories: [
    './Introduction.mdx',
    './Crawling.stories.tsx',
    '../src/**/*.new.stories.tsx',
    '../src/**/*.mdx',
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
            replacement: createRequire(import.meta.url).resolve(
              'coveo.analytics/dist/browser.mjs'
            ),
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
        virtualCustomElementTags(),
        virtualOpenApiModules(),
        tailwindcss(),
        resolvePathAliases(),
        markComponentImportsAsSideEffectful(configType),
        processInlineCssImports(),
        forceInlineCssImports(),
        svgTransform(),
        virtualAssetsList(),
        externalizeDependencies(configType),
      ],
    });
  },
};

const resolvePathAliases = (): Plugin => {
  return {
    name: 'resolve-path-aliases',
    enforce: 'pre',
    async resolveId(source: string, importer, options) {
      if (source.startsWith('@/')) {
        const aliasPath = source.slice(2); // Remove the "@/" prefix
        const resolvedPath = path.resolve(__dirname, `../${aliasPath}`);

        return this.resolve(resolvedPath, importer, options);
      }
    },
  };
};

const forceInlineCssImports = (): Plugin => {
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

const svgTransform = (): Plugin => {
  return {
    name: 'svg-transform',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return code.replace(
          /import\s+([a-zA-Z]+)\s+from\s+['"]([^'"]+\.svg)['"]/g,
          (_, importName, importPath) => {
            const svgContent = readFileSync(
              resolve(dirname(id), importPath),
              'utf8'
            )
              .replace(/\r?\n/g, '')
              .replace(/'/g, "\\'");
            return `const ${importName} = '${svgContent}';`;
          }
        );
      }
      return null;
    },
  };
};

/**
 * Process Tailwind CSS directives inside Lit `css` tagged template literals.
 *
 * Components use `@import`, `@reference`, and `@apply` in `css\`...\`` templates
 * for their shadow DOM styles. In production builds, the `litCssPlugin`
 * post-processes these through PostCSS. In dev mode (Storybook), we need this
 * Vite plugin to do the same — constructable stylesheets don't support these
 * directives, so the CSS must be fully resolved before reaching the browser.
 */
const processInlineCssImports = (): Plugin => {
  // biome-ignore lint/suspicious/noExplicitAny: PostCSS plugin types are complex
  let postcssPlugins: any[];
  let initialized = false;

  return {
    name: 'process-inline-css-imports',
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0];
      if (!cleanId.endsWith('.ts')) return null;

      const cssPattern = /css\s*`([\s\S]*?)`/g;
      const matches = [...code.matchAll(cssPattern)];
      const tailwindMatches = matches.filter(
        (m) =>
          m[1].includes('@import') ||
          m[1].includes('@reference') ||
          m[1].includes('@apply')
      );
      if (tailwindMatches.length === 0) return null;

      if (!initialized) {
        const {default: tailwindPostcss} = await import('@tailwindcss/postcss');
        postcssPlugins = [tailwindPostcss()];
        initialized = true;
      }

      const {default: postcss} = await import('postcss');
      let result = code;

      for (const match of tailwindMatches.reverse()) {
        const processed = await postcss(postcssPlugins).process(match[1], {
          from: id,
        });
        // Escape backticks and template expression markers so the
        // processed CSS can safely live inside a tagged template literal.
        const escaped = processed.css
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$\{/g, '\\${');
        result =
          result.slice(0, match.index) +
          `css\`${escaped}\`` +
          result.slice(match.index! + match[0].length);
      }

      return {code: result, map: null};
    },
  };
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
        const filePathRelativeToRoot = relative(
          absolutePathToRoot,
          resolve(dirname(source), id)
        );
        if (
          filePathRelativeToRoot.match(
            /^src\/components\/\w*\/([\w-]*)\/\1(\.js)?$/
          )
        ) {
          const resolution = await this.resolve(id, source, options);

          if (configType === 'PRODUCTION' && !isChromatic()) {
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
      if (
        configType === 'PRODUCTION' &&
        !isChromatic() &&
        id.startsWith('\0virtual-empty:')
      ) {
        // Return empty exports for stubbed components
        return 'export default {};';
      }
      return null;
    },
  };
}

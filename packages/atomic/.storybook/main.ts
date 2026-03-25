import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import path, {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {StorybookConfig} from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import type {Plugin} from 'vite';
import {mergeConfig} from 'vite';
import {generateExternalPackageMappings} from '../scripts/externalPackageMappings.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure directories referenced in staticDirs exist before Storybook validates them.
// The prepareStorybookAssets plugin populates these during buildStart, which runs later.
mkdirSync(resolve(__dirname, 'static/assets'), {recursive: true});
mkdirSync(resolve(__dirname, '../src/assets/lang'), {recursive: true});

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

const externalizeDependencies = (): Plugin => {
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
    './Introduction.mdx',
    './Crawling.stories.tsx',
    '../src/**/*.new.stories.tsx',
    '../src/**/*.mdx',
    '../storybook-pages/**/*.new.stories.tsx',
    '../storybook-pages/**/*.mdx',
  ],
  staticDirs: [
    {from: './static/assets', to: '/assets'},
    {from: '../src/assets/lang', to: '/lang'},
    {from: '../src/assets/lang', to: './lang'},
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
        markComponentImportsAsSideEffectful(),
        processInlineCssImports(),
        forceInlineCssImports(),
        svgTransform(),
        prepareStorybookAssets(),
        configType === 'PRODUCTION' && isCDN && externalizeDependencies(),
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

/**
 * Generate static assets that Storybook needs at startup:
 * 1. Salesforce Design System icons → .storybook/static/assets/
 * 2. Per-locale JSON files from src/locales.json → src/assets/lang/
 * 3. dayjs locale import map → src/generated/dayjs-locales-data.ts
 */
const prepareStorybookAssets = (): Plugin => {
  const require = createRequire(import.meta.url);

  return {
    name: 'prepare-storybook-assets',
    buildStart() {
      const srcDir = resolve(__dirname, '../src');
      const assetsDir = resolve(__dirname, 'static/assets');

      // ── 1. Copy Salesforce icons ──
      const salesforceDir = dirname(
        require.resolve('@salesforce-ux/design-system/package.json')
      );
      mkdirSync(assetsDir, {recursive: true});

      for (const subpath of ['doctype', 'standard']) {
        const icons = readdirSync(
          join(salesforceDir, 'assets/icons', subpath),
          {recursive: true, withFileTypes: true}
        );
        for (const icon of icons) {
          if (icon.isFile() && extname(icon.name) === '.svg') {
            copyFileSync(
              join(salesforceDir, 'assets/icons', subpath, icon.name),
              join(assetsDir, icon.name)
            );
          }
        }
      }
      copyFileSync(
        join(salesforceDir, 'assets/icons/utility/sparkles.svg'),
        join(assetsDir, 'sparkles.svg')
      );

      // Write docs/assets.json (consumed by atomic-icon stories)
      const docsDir = resolve(__dirname, '../docs');
      mkdirSync(docsDir, {recursive: true});
      writeFileSync(
        join(docsDir, 'assets.json'),
        JSON.stringify({assets: readdirSync(assetsDir).sort()})
      );

      // ── 2. Generate locale files ──
      const localesData = JSON.parse(
        readFileSync(join(srcDir, 'locales.json'), 'utf8')
      );
      const localesMap: Record<string, Record<string, string>> = {dev: {}};
      for (const [stringKey, stringValues] of Object.entries(localesData)) {
        for (const [localeKey, localeStringValue] of Object.entries(
          stringValues as Record<string, string>
        )) {
          if (!localesMap[localeKey]) localesMap[localeKey] = {};
          localesMap[localeKey][stringKey] = localeStringValue;
          localesMap.dev[stringKey] = stringKey;
        }
      }

      const langDir = join(srcDir, 'assets/lang');
      rmSync(langDir, {recursive: true, force: true});
      mkdirSync(langDir, {recursive: true});
      for (const [localeKey, localeData] of Object.entries(localesMap)) {
        writeFileSync(
          join(langDir, `${localeKey}.json`),
          JSON.stringify(localeData)
        );
      }

      const generatedDir = join(srcDir, 'generated');
      mkdirSync(generatedDir, {recursive: true});
      writeFileSync(
        join(generatedDir, 'availableLocales.json'),
        JSON.stringify(Object.keys(localesMap).map((k) => k.toLowerCase()))
      );

      // ── 3. Generate dayjs locale imports ──
      const dayJsLocales = JSON.parse(
        readFileSync(require.resolve('dayjs/locale.json'), 'utf8')
      );
      let fileContent =
        'export const locales: Record<string, () => Promise<unknown>> = {';
      for (const locale of dayJsLocales) {
        const key = locale.key;
        const parts = key.split('-');
        const i18nKey =
          parts.length > 1 ? `${parts[0]}-${parts[1].toUpperCase()}` : key;
        const mapKey = i18nKey.includes('-') ? `'${i18nKey}'` : i18nKey;
        fileContent += `\n  ${mapKey}: () => import('dayjs/locale/${key}'),`;
      }
      fileContent += '\n};\n';
      writeFileSync(join(generatedDir, 'dayjs-locales-data.ts'), fileContent);
    },
  };
};

export default config;
function markComponentImportsAsSideEffectful(): Plugin {
  const absolutePathToSrc = resolve(__dirname, '../src');
  return {
    name: 'mark-components-as-side-effectful',
    enforce: 'pre',
    async resolveId(id, source, options) {
      if (
        source?.startsWith(absolutePathToSrc) &&
        (id.startsWith('.') || id.startsWith(absolutePathToSrc))
      ) {
        const filePathRelativeToSrc = relative(
          absolutePathToSrc,
          resolve(dirname(source), id)
        );
        if (
          filePathRelativeToSrc.match(/^components\/\w*\/([\w-]*)\/\1(\.js)?$/)
        ) {
          const resolution = await this.resolve(id, source, options);
          return {id: resolution!.id, moduleSideEffects: true};
        }
      }
      return null;
    },
  };
}

import {cpSync, readFileSync} from 'node:fs';
import {resolve, join, dirname} from 'node:path';
import {defineConfig, Plugin} from 'vite';
//@ts-ignore
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';
import tailwindcssVite from '@tailwindcss/vite';
import tailwindcssPostCss from '@tailwindcss/postcss';

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

      const {default: postcss} = await import('postcss');
      let result = code;

      for (const match of tailwindMatches.reverse()) {
        const processed = await postcss([tailwindcssPostCss()]).process(
          match[1],
          {
            from: id,
          }
        );
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

const {version} = JSON.parse(
  readFileSync(join(import.meta.dirname, 'package.json'), 'utf8')
);

const packageMappings = generateExternalPackageMappings();
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

export default defineConfig({
  define: {
    'process.env.VERSION': JSON.stringify(version),
  },
  plugins: [
    tailwindcssVite(),
    processInlineCssImports(),
    forceInlineCssImports(),
    svgTransform(),
    {
      name: 'externalize-deps',
      enforce: 'pre',
      async resolveId(source, importer) {
        const packageMapping = packageMappings[source];
        if (packageMapping) {
          return {
            id: packageMapping.cdn,
            external: 'absolute',
          };
        } else {
          return null;
        }
      },
    },
  ],
  build: {
    lib: {
      entry: {
        'atomic.esm': './src/cdn.ts',
        index: './src/loader.ts',
        'index.esm': './src/index.ts',
      },
      formats: ['es'],
    },
    outDir: 'cdn',
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        keepNames: true,
        strictExecutionOrder: true,
      },
      tsconfig: 'tsconfig.lit.json',
      plugins: [
        {
          name: 'tw-css-inline',
          async resolveId(source, importer) {
            if (source.endsWith('tailwind.global.tw.css')) {
              const resolved = await this.resolve(
                source + '?inline',
                importer,
                {skipSelf: true}
              );
              if (resolved) {
                return resolved;
              }
            }
          },
        },
        {
          name: 'copy-assets',
          writeBundle() {
            const copies = [
              {from: 'dist/lang', to: 'lang'},
              {from: 'dist/assets', to: 'assets'},
              {from: 'dist/themes', to: 'themes'},
            ];
            for (const {from, to} of copies) {
              cpSync(resolve(from), resolve('cdn', to), {recursive: true});
            }
          },
        },
      ],
    },
  },
});

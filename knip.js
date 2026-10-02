// Knip's built-in Tailwind compiler only follows @import/@config/@plugin, so
// @reference (Tailwind v4) is added here to avoid false "unused" reports.
const CSS_IMPORT_AT_RULE = /@(?:import|config|plugin|reference)\s+['"]([^'"]+)['"]/g;
const CSS_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/g;
const LIT_STYLE_BLOCK = /css\s?`([\s\S]*?)`/g;
// Protocol-relative or scheme-prefixed targets are fetched at runtime, not bundled.
const EXTERNAL_TARGET = /^(?:\/\/|[a-z][a-z\d+.-]*:)/i;

const cssImportsIn = (css) =>
  [...css.replace(CSS_COMMENT, '').matchAll(CSS_IMPORT_AT_RULE)]
    .map(([, target]) => target)
    .filter((target) => !EXTERNAL_TARGET.test(target));

const asImportStatements = (targets) => targets.map((target) => `import '${target}';`).join('\n');

const containsImportAtRule = (text) => /@(?:import|config|plugin|reference)/.test(text);

// Run `pnpm knip` locally when editing either compiler: the Knip CI job only
// runs when a package is rebuilt, so a change to this file alone isn't
// exercised by affected-based CI.
const cssCompiler = (text) =>
  containsImportAtRule(text) ? asImportStatements(cssImportsIn(text)) : '';

// Lit `css` template literals can also contain these at-rules (resolved at
// build time by packages/atomic/scripts/lit-css-plugin.mjs), so their imports
// are extracted and appended, leaving existing line numbers untouched.
const litStyleCompiler = (text) => {
  if (!/css\s?`/.test(text) || !containsImportAtRule(text)) {
    return text;
  }

  const targets = [...text.matchAll(LIT_STYLE_BLOCK)].flatMap(([, block]) => cssImportsIn(block));

  return targets.length > 0 ? `${text}\n${asImportStatements(targets)}\n` : text;
};

export default {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  // Always ignoring quantic since it throws errors. Adding those two lines is necessary for 100% of quantic to be ignored.
  ignoreWorkspaces: ['packages/quantic', 'packages/create-atomic-component-project/template'],
  ignoreDependencies: ['semver'],
  ignore: [
    '.agents/skills/**',
    '.github/actions/run-affected/test-resolve-tasks.mjs',
    'packages/quantic/**',
    'samples/headless/rga-react/src/components/Quickstart.tsx',
    'samples/headless/rga-react/src/components/Citation.tsx',
    'samples/headless/rga-react/src/components/CitationsList.tsx',
    'packages/pkg-new-template/**',
    // Registering a CSS compiler makes .css a project extension in every
    // workspace. These samples reference their stylesheets in ways Knip cannot
    // follow — an absolute `<link href="/src/style.css">`, an `@import` inside
    // a Vue `<style>` block, and Angular `styleUrls` — so they would all be
    // reported as unused.
    'samples/atomic/**/*.css',
  ],
  compilers: {
    mdx: true, // Traces imports inside .mdx Storybook docs pages.
    css: cssCompiler,
    ts: litStyleCompiler,
  },
  workspaces: {
    '.': {
      entry: ['scripts/**/*.{js,mjs}'],
      ignoreBinaries: ['ts-node'],
      ignoreDependencies: ['@playwright/mcp'],
    },
    'packages/headless': {
      entry: ['src/*index.ts', 'ponyfills/*.js'],
      ignoreDependencies: ['reselect', 'node-fetch'],
    },
    'packages/atomic-hosted-page': {
      entry: ['src/atomic-hosted-page.esm.ts', 'dev/vite.config.ts'],
    },
    'packages/atomic-theming-e2e': {
      entry: ['tests/**/*.spec.ts', 'fixtures/*.js'],
    },
    'packages/atomic-playground': {
      entry: ['*.js'],
      ignoreDependencies: [
        'dayjs', // Transitive dep pre-bundled via optimizeDeps.include in vite.config.ts.
      ],
    },
    'packages/atomic-angular': {
      ignoreDependencies: [
        // Can be removed once we bump our package to use more recent Angular versions that support Vite 7+.
        'vite',
        'rxjs', // Used by generated Angular wrapper; Knip can't trace it.
      ],
    },
    'packages/atomic-angular/projects/atomic-angular': {
      entry: ['src/public-api.ts'],
      ignore: [
        'src/utils.ts', // Only used by generated files, so it 'seems' to have unused exports, but it's actually used.
      ],
    },
    'packages/atomic-react': {
      entry: ['src/*index.ts'],
      ignoreDependencies: [
        '@lit/react', // Only used in generated files.
      ],
    },
    'packages/headless-react': {
      // @types/react is an optional peer dep but referenced in source — consumers
      // provide it, so we suppress the knip warning.
      ignoreDependencies: ['@types/react'],
    },
    'packages/relay': {
      entry: ['src/relay.ts', 'config/rollup.config.mjs'],
    },
    'packages/coveo-analytics': {
      // The package publishes `src/**/*.ts` and supports deep imports, so every
      // source module is part of its public surface, not just the bundle entries.
      // `bundle/browser-fetch.ts` is reachable only through the Rollup alias that
      // swaps out `cross-fetch` for browser builds.
      entry: ['src/**/*.ts', 'bundle/browser-fetch.ts'],
      // These modules intentionally expose two public bindings for the same
      // value: a named export plus a `default`, or a short plugin alias such as
      // `EC = ECPlugin`. Both spellings are part of the published API and are
      // reachable through deep imports, so neither can be dropped. Scoped to the
      // known files so new duplicate exports elsewhere in the package still fail.
      ignoreIssues: {
        'src/client/analytics.ts': ['duplicates'],
        'src/coveoua/simpleanalytics.ts': ['duplicates'],
        'src/donottrack.ts': ['duplicates'],
        'src/history.ts': ['duplicates'],
        'src/plugins/ec.ts': ['duplicates'],
        'src/plugins/link.ts': ['duplicates'],
        'src/plugins/svc.ts': ['duplicates'],
      },
    },
    'packages/documentation': {
      entry: [
        '**/assets/**/*.js',
        '**/lib/*.ts',
        '**/*.css', //TODO: Find a better solution
      ],
    },
    'samples/headless/commerce-react': {
      // ShowMore and ProductsPerPage are kept as reference examples but are not
      // wired into the UI, so Knip should not flag them as unused files.
      ignore: ['src/components/show-more/**', 'src/components/products-per-page/**'],
    },
    'samples/headless-ssr/commerce-express': {
      entry: ['src/server.ts'],
    },
    'samples/headless-ssr/commerce-nextjs': {
      // `mock-server.mjs` is a test utility, not exported publicly nor imported internally, so Knip cannot trace it.
      entry: ['mocks/mock-server.mjs'],
    },
    'samples/headless-ssr/commerce-nextjs-v4': {},
    'samples/headless-ssr/commerce-react-router': {
      // Generated by `react-router typegen` into .react-router/types/ via rootDirs.
      // Not present during static analysis in CI.
      ignoreUnresolved: [/^\.\/\+types\/.+/],
    },
    'samples/atomic/commerce-vite': {
      // Knip cannot load vite.config.js because it throws when @coveo/atomic
      // build artifacts (dist/lang, dist/assets) are missing. Disable the Vite
      // plugin config loader.
      vite: {config: []},
      entry: ['src/*-page.js'],
    },
    'samples/atomic/search-vite': {
      // Same as commerce-vite: vite.config.js throws without build artifacts.
      vite: {config: []},
    },
    'utils/ci': {},
    'utils/cdn': {},

    // Projects to enable rule by rule.
    'packages/atomic': {
      // The `@/*` path alias is declared in packages/atomic/tsconfig.json, but
      // oxc-resolver >=11.21 only applies a tsconfig's `paths` to files that the
      // tsconfig "owns" (its `include` globs cover only .ts/.tsx). Imports from
      // .mdx Storybook docs pages are therefore not aliased, so we declare the
      // alias explicitly here for Knip's resolver.
      paths: {
        '@/*': ['./*'],
      },
      entry: [
        'src/loader.ts',
        'src/cdn.ts',
        'src/**/*.e2e.ts',
        'dev/**/*.{ts,js,mjs}',
        'scripts/**/*.{mjs,js,ts}',
        'csp/**/*.{mjs,js}',
        'custom-elements-manifest.config.mjs',
        // Build-generated barrel indexes (created by `pnpm build:lit`).
        // In CI the build step runs before knip, so these always exist.
        // Adding them as entry points lets knip trace the export chain
        // into section components and other web components naturally.
        'src/components/*/index.ts',
        // Test fixture utilities consumed by spec files via @/ path alias.
        'vitest-utils/**/*.ts',
        // Interactive a11y Storybook helpers — will be consumed by stories
        // in an upcoming PR. Knip cannot trace them yet.
        'storybook-utils/a11y/**/*.ts',
        // Published as `@coveo/atomic/themes/*` and copied to dist by
        // scripts/build-themes.mjs, so they are entry points rather than
        // stylesheets imported from source.
        'src/themes/*.css',
      ],
      ignore: [
        // Static file loaded via HTML <script> tag in manager-head.html
        '.storybook/public/cookieManager.js',
      ],
    },
    'packages/atomic-legacy': {},
    'packages/create-atomic': {
      ignore: ['**/*'],
    },
    'packages/create-atomic-template': {
      ignore: ['**/*'],
    },
    'packages/shopify': {
      ignore: ['**/*'],
    },
    'samples/headless-ssr/search-nextjs': {
      ignore: ['**/*'],
    },
    'packages/create-atomic-component': {
      ignore: ['template/**/*'],
    },
    'packages/create-atomic-result-component': {
      ignore: ['template/**/*'],
    },
    'packages/thermidor': {
      entry: ['src/**/*.test-d.ts'],
      ignoreExportsUsedInFile: false,
    },
  },
};

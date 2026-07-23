export default {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  // Always ignoring quantic since it throws errors. Adding those two lines is necessary for 100% of quantic to be ignored.
  ignoreWorkspaces: ['packages/quantic', 'packages/create-atomic-component-project/template'],
  ignoreDependencies: ['semver'],
  ignore: [
    'packages/quantic/**',
    // Temporary until CAJS package activation supplies package metadata and entry points.
    'packages/coveo-analytics/**',
    'samples/headless/rga-react/src/components/Quickstart.tsx',
    'samples/headless/rga-react/src/components/Citation.tsx',
    'samples/headless/rga-react/src/components/CitationsList.tsx',
    'packages/pkg-new-template/**',
  ],
  compilers: {
    // Enable the built-in MDX compiler so Knip can trace imports inside .mdx
    // Storybook docs pages (e.g. storybook-utils helpers).
    mdx: true,
  },
  workspaces: {
    '.': {
      entry: ['.agents/skills/**/scripts/*.mjs', 'scripts/**/*.{js,mjs}'],
      ignoreBinaries: ['ts-node'],
      ignoreDependencies: ['@playwright/mcp', 'handlebars'],
    },
    'packages/headless': {
      entry: ['src/*index.ts', 'ponyfills/*.js'],
      ignoreDependencies: ['reselect', 'node-fetch'],
    },
    'packages/atomic-hosted-page': {
      entry: ['src/atomic-hosted-page.esm.ts', 'dev/vite.config.ts'],
    },
    'packages/atomic-angular': {
      ignoreDependencies: [
        // Can be removed once we bump our package to use more recent Angular versions that support Vite 7+.
        'vite',
      ],
    },
    'packages/atomic-angular/projects/atomic-angular': {
      entry: ['src/public-api.ts'],
      ignore: [
        'src/utils.ts', // Only used by generated files, so it 'seems' to have unused exports, but it's actually used.
      ],
    },
    'packages/atomic-react': {
      entry: ['src/*index.ts'],
      ignoreDependencies: [
        '@lit/react', // Only used in generated files.
      ],
    },
    'packages/headless-react': {
      ignoreDependencies: ['@types/react-dom', '@types/react'],
    },
    'packages/auth': {
      entry: ['src/auth.ts'],
    },
    'packages/relay': {
      entry: ['src/relay.ts', 'config/rollup.config.mjs'],
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
    'samples/headless/search-react': {
      entry: ['server/server.tsx'],
      ignore: [
        'src/pages/AtomicReactPage.css', // TODO: Reassess if we can remove the file.
      ],
    },
    'samples/headless-ssr/commerce-nextjs': {
      // `mock-server.mjs` is a test utility, not exported publicly nor imported internally, so Knip cannot trace it.
      entry: ['mocks/mock-server.mjs'],
    },
    'samples/headless-ssr/commerce-nextjs-v4': {},
    'samples/atomic/commerce-vite': {
      // The search and listing pages share commerce-page.js. Vite resolves the
      // HTML entries at runtime, so declare the shared JS entry explicitly
      // (index.html → home-page.js is auto-detected).
      entry: ['src/commerce-page.js'],
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
        'scripts/**/*.{mjs,js}',
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
      ],
      ignore: [
        // Ambient type declaration file, not an ES module
        '.storybook/vite-env.d.ts',
        // Static file loaded via HTML <script> tag in manager-head.html
        '.storybook/public/cookieManager.js',
        // CSS files referenced via @import/@reference inside CSS tagged template literals.
        // Knip cannot trace CSS imports inside template literal strings.
        'src/**/*.css',
      ],
    },
    'packages/atomic-legacy': {},
    'packages/atomic-a11y': {
      ignoreBinaries: ['gh'],
    },
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
      ignore: ['**/*'],
    },
    'samples/thermidor/generative-react': {
      ignore: ['**/*'],
    },
    'samples/thermidor/generative-angular': {
      entry: ['proxy.conf.js'],
      ignore: ['src/app/services/engine.service.ts', 'src/app/app.css', 'src/styles.css'],
    },
  },
};

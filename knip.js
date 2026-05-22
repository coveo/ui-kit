export default {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  // Always ignoring quantic since it throws errors. Adding those two lines is necessary for 100% of quantic to be ignored.
  ignoreWorkspaces: [
    'packages/quantic',
    'packages/create-atomic-component-project/template',
  ],
  ignoreDependencies: ['semver'],
  ignore: [
    'packages/quantic/**',
    'samples/headless/rga-react/src/components/Quickstart.tsx',
    'samples/headless/rga-react/src/components/Citation.tsx',
    'samples/headless/rga-react/src/components/CitationsList.tsx',
    'samples/pkg-new-template/**',
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
      ignoreDependencies: ['reselect', 'node-fetch', 'jsdom'],
    },
    'packages/atomic-hosted-page': {
      entry: ['src/atomic-hosted-page.esm.ts', 'dev/vite.config.ts'],
      ignoreDependencies: ['local-web-server'],
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
      ignoreDependencies: ['@types/react-dom', '@types/react', 'jsdom'],
    },
    'packages/auth': {
      entry: ['src/auth.ts'],
    },
    'packages/documentation': {
      entry: [
        '**/assets/**/*.js',
        '**/lib/*.ts',
        '**/*.css', //TODO: Find a better solution
      ],
    },
    'samples/headless/commerce-react': {
      // Can be removed once the deprecated controller is removed from headless. https://coveord.atlassian.net/browse/KIT-5551
      ignore: ['src/components/legacy-field-suggestions/**'],
      ignoreDependencies: ['jsdom'],
    },
    'samples/headless-ssr/commerce-express': {
      entry: ['src/server.ts'],
    },
    'samples/headless/search-react': {
      entry: ['server/server.tsx'],
      ignoreDependencies: ['jsdom'],
      ignore: [
        'src/pages/AtomicReactPage.css', // TODO: Reassess if we can remove the file.
      ],
    },
    'samples/headless-ssr/commerce-nextjs': {},
    'samples/headless-ssr/commerce-nextjs-v4': {},
    'utils/ci': {},
    'utils/cdn': {
      ignoreDependencies: ['local-web-server'],
    },

    // Projects to enable rule by rule.
    'packages/atomic': {
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
        // Knip cannot resolve the @/ → ./ tsconfig path mapping, so it
        // cannot trace spec → fixture imports. Declaring them as entry
        // points preserves their exports from false-positive removal.
        'vitest-utils/**/*.ts',
        // Interactive a11y Storybook helpers — will be consumed by stories
        // in an upcoming PR. Knip cannot trace them yet.
        'storybook-utils/a11y/**/*.ts',
        // Request transformer modules for interactive MSW stories.
        // Wired by downstream feature branches via withRequestTransformer().
        'storybook-utils/api/**/*-transformer.ts',
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
      ignoreDependencies: [
        // local-web-server provides the `ws` binary invoked as `pnpm exec ws`
        // in playwright.config.ts webServer. Knip cannot trace CLI binary usage.
        'local-web-server',
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
    'samples/atomic/search-stencil': {
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
  },
};

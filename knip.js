export default {
  $schema: 'https://unpkg.com/knip@5/schema.json',

  // Always ignoring quantic since it throws errors. Adding those two lines is necessary for 100% of quantic to be ignored.
  ignoreWorkspaces: [
    'packages/quantic',
    'packages/create-atomic-component-project/template',
  ],
  ignore: [
    'packages/quantic/**',
    'samples/headless/rga-react/src/components/Quickstart.tsx',
    'samples/headless/rga-react/src/components/Citation.tsx',
    'samples/headless/rga-react/src/components/CitationsList.tsx',
  ],

  // Enable back the plugin once https://github.com/webpro-nl/knip/issues/1154 is resolved.
  biome: false,
  workspaces: {
    '.': {
      entry: ['.agents/skills/**/scripts/*.mjs', 'scripts/**/*.{js,mjs}'],
      ignoreBinaries: ['ts-node', 'dev'],
      ignoreDependencies: ['@playwright/mcp', 'handlebars'],
    },
    'packages/headless': {
      entry: ['src/*index.ts', 'ponyfills/*.js'],
      ignoreDependencies: ['navigator.sendbeacon', 'reselect', 'node-fetch'],
    },
    'packages/atomic-hosted-page': {
      entry: [
        'src/atomic-hosted-page.esm.ts',
        'loader/index.js',
        'dev/vite.config.ts',
      ],
      ignore: ['cdn/**'],
      ignoreDependencies: ['local-web-server'],
    },
    'packages/atomic-angular': {
      ignoreDependencies: [
        'rxjs',
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
      ignore: ['src/components/stencil-generated/**/*.{ts,tsx}'],
      ignoreUnresolved: [/\.{1,2}\/([\w.]*?\/)?components\.js/],
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
      entry: ['**/assets/**/*.js', '**/lib/*.ts'],
    },
    'samples/headless/commerce-react': {
      // Can be removed once the deprecated controller is removed from headless.
      ignore: ['src/components/legacy-field-suggestions/**'],
      ignoreDependencies: ['jsdom'],
    },
    'samples/headless-ssr/commerce-express': {
      entry: ['src/server.ts', 'src/client.ts'],
    },
    'samples/headless/search-react': {
      entry: ['server/server.tsx', 'src/index.tsx'],
      ignoreDependencies: ['jsdom'],
    },
    'utils/ci': {
      ignoreDependencies: ['@types/conventional-changelog-writer'],
    },
    'utils/cdn': {
      ignoreDependencies: ['@coveo/bueno', 'local-web-server'],
    },

    // Projects to enable bunch by bunch.
    'packages/atomic': {
      ignore: [
        '**/*.e2e.ts',
        '**/e2e/*',
        'vitest-utils/**/*',
        'storybook-utils/**/*',
        'dev/**/*',
        'scripts/**/*',
        'playwright-utils/**/*',
        'csp/server.mjs',
        '.storybook/vite-env.d.ts',
        '.storybook/public/cookieManager.js',
        'custom-elements-manifest.config.mjs',
        'fake-loader/**/*',
      ],
      ignoreDependencies: ['tailwindcss'],
      entry: ['src/index.ts', 'src/loader.ts', 'src/components/index.ts'],
    },
    'packages/atomic-legacy': {
      ignore: ['**/*'],
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

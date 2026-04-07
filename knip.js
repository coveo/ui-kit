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
    'samples/headless/commerce-custom-context-native/engineWithPopulatedContext.js',
    'samples/headless/commerce-custom-context-native/styles.css',
  ],
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

    // Projects to enable bunch by bunch.
    'packages/atomic': {
      ignore: ['**/*'],
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

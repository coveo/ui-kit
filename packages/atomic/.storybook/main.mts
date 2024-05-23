import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type {StorybookConfig} from '@storybook/web-components-vite';
import {mergeConfig} from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.new.stories.@(js|jsx|ts|tsx|mdx)'],
  staticDirs: [{from: '../dist/atomic', to: './assets'}],
  previewHead: (head) => `
    ${head}
    <script type="module" src="../dist/atomic/atomic.esm.js"></script>
    <link rel="stylesheet" href="../dist/atomic/themes/coveo.css">
  `,
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@whitespace/storybook-addon-html',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },

  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [nxViteTsPaths()],
    }),
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs

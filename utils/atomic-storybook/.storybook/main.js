const path = require('path');
const atomicDirectory = path.join(
  require.resolve('@coveo/atomic/package.json'),
  '..'
);

/** @type {import('@storybook/core-common').StorybookConfig} */
module.exports = {
  stories: [
    path.join(atomicDirectory, 'src/**/*.stories.mdx'),
    path.join(atomicDirectory, 'src/**/*.stories.tsx'),
  ],
  staticDirs: ['../public'],
  features: {
    storyStoreV7: false,
  },
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    './preset.js',
  ],
  /** @type {import('webpack')['config']['getNormalizedWebpackOptions']} */
  webpack: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        modules: module.paths,
        alias: {
          'atomic-storybook': path.resolve('.storybook'),
        },
      },
      performance: {
        hints: false,
      },
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.(tsx)$/,
            exclude: /shadow-parts-addon/,
            loader: path.resolve('./.storybook/loader.js'),
          },
        ],
      },
    };
  },
  babelDefault: (config) => {
    return {
      ...config,
      plugins: [
        [
          require.resolve('@babel/plugin-transform-react-jsx'),
          {
            pragma: 'h',
          },
          'preset',
        ],
      ],
    };
  },
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  docs: {
    autodocs: false,
  },
};

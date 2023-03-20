const path = require('path');

const atomicDirectory = path.join(
  require.resolve('@coveo/atomic/package.json'),
  '..'
);

/** @type {import('@storybook/core-common').StorybookConfig} */
module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: [
    path.join(atomicDirectory, 'src/**/*.stories.mdx'),
    path.join(atomicDirectory, 'src/**/*.stories.tsx'),
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    './preset.js',
  ],
  /** @type {import('webpack')['config']['getNormalizedWebpackOptions']} */
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        modules: module.paths,
        alias: {'atomic-storybook': path.resolve('.storybook')},
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
        ...config.plugins,
        [
          require.resolve('@babel/plugin-transform-react-jsx'),
          {pragma: 'h'},
          'preset',
        ],
      ],
    };
  },
};

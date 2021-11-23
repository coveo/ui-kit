const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    './preset.js',
  ],
  webpack: (config) => {
    return {
      ...config,
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

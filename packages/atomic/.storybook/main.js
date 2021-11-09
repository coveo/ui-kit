const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    './preset.js',
  ],
  webpack: (config) => {
    console.log(config.module.rules)
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
          {
            test: /monaco-editor\/.*\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /monaco-editor\/.*\.ttf$/,
            use: ['file-loader']
          }
        ],
      },
      plugins: [
        ...config.plugins,
        new MonacoWebpackPlugin({languages: ['html']}),
      ],
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

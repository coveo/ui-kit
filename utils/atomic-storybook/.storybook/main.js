import { dirname, join } from "path";
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
  staticDirs: [path.join(atomicDirectory, 'dist')],
  addons: [
    getAbsolutePath("@storybook/addon-controls"),
    getAbsolutePath("@storybook/addon-viewport"),
    '@storybook/addon-webpack5-compiler-swc',
    './preset.js',
  ],
  /** @type {import('webpack')['config']['getNormalizedWebpackOptions']} */
  webpackFinal: async (config) => {
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
        unknownContextCritical: false,
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
    name: getAbsolutePath("@storybook/html-webpack5"),
    options: {},
  },
  docs: {
    autodocs: false,
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

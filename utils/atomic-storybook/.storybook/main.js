const path = require('path');
const fs = require('fs');

process.env.STORYBOOK_STENCIL_DOCS = fs
  .readFileSync(process.env.STORYBOOK_STENCIL_DOCS_LOCATION)
  .toString();

/**
 * @param {string} path
 */
function isDirectoryAllowed(path) {
  const requiredPermissions =
    fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK;
  try {
    fs.accessSync(path, requiredPermissions);
    return true;
  } catch (e) {
    return false;
  }
}

function getOwnNodeModules(searchFrom = __dirname) {
  const parentPath = path.join(searchFrom, '..');
  const parentNodeModules =
    parentPath !== searchFrom && isDirectoryAllowed(parentPath)
      ? getOwnNodeModules(parentPath)
      : [];
  const nodeModulesPath = path.join(searchFrom, 'node_modules');
  return fs.existsSync(nodeModulesPath)
    ? [nodeModulesPath, ...parentNodeModules]
    : parentNodeModules;
}

function getNodeModulePaths() {
  const ownNodeModules = __dirname
    .split(path.delimiter)
    .slice(0, -1)
    .filter((dirName, i, allDirs) => {
      const fullPath = allDirs.slice(dirName);
    });
}

const stories = JSON.parse(process.env.STORYBOOK_STENCIL_STORIES || '[]');

if (!stories.length) {
  throw 'No stories';
}

const modules = [
  ...getOwnNodeModules(),
  path.join(process.env.STORYBOOK_CALLER, 'node_modules'),
];

console.info('MODULES', modules);

/** @type {import('@storybook/core-common').StorybookConfig} */
module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: stories,
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    require.resolve('./preset.js'),
  ],
  /** @type {import('webpack')['config']['getNormalizedWebpackOptions']} */
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        extensions: [...config.resolve.extensions, '.ts', '.tsx'],
        modules,
        alias: {
          '@coveo/atomic-storybook': path.resolve(__dirname, '..', 'index.ts'),
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
            loader: require.resolve('./loader.js'),
          },
        ],
      },
    };
  },
  /** @type {import('@babel/core').ConfigFunction} */
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

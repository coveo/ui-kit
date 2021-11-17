const path = require('path');
const fs = require('fs');
const {DefinePlugin} = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const base = {
  mode: getMode(),
  entry: {
    headless: './src/index.ts',
    recommendation: './src/recommendation.index.ts',
    'product-recommendation': './src/product-recommendation.index.ts',
    'product-listing': './src/product-listing.index.ts',
    'case-assist': './src/case-assist.index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    define(),
  ]
};

function getMode() {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

function define() {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  return new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(getMode()),
    'process.env.VERSION': JSON.stringify(version),
  });
}

function getFileName(data) {
  const name = data.chunk.name;
  return name === 'headless' ? name : `${name}/headless`;
}

function browserAlias() {
  return {
    'coveo.analytics': path.resolve(
      __dirname,
      './node_modules/coveo.analytics/dist/library.es.js'
    ),
    'cross-fetch': path.resolve(__dirname, './fetch-ponyfill.js'),
    'web-encoding': path.resolve(
      __dirname,
      './node_modules/web-encoding/src/lib.js'
    ),
  };
}

const browserBase = {
  ...base,
  devtool: 'source-map',
  optimization: {
    minimizer: [new TerserPlugin({extractComments: false})],
  },
}

function buildBrowserUmd(entry) {
  const [entryName, entryPath] = entry;
  const umdGlobalName = getUmdGlobalName(entryName);

  return {
    ...browserBase,
    entry: {
      [entryName]: entryPath,
    },
    target: 'web',
    output: {
      filename: (data) => `${getFileName(data)}.js`,
      path: path.resolve(__dirname, 'dist/browser'),
      library: {
        type: 'umd',
        name: umdGlobalName,
      },
    },
    resolve: {
      ...base.resolve,
      alias: browserAlias(),
    },
  }
};

function getUmdGlobalName(entryName) {
  const map = {
    headless: 'CoveoHeadless',
    recommendation: 'CoveoHeadlessRecommendation',
    'case-assist': 'CoveoHeadlessCaseAssist',
    'product-recommendation': 'CoveoHeadlessProductRecommendation',
    'product-listing': 'CoveoHeadlessProductListing',
  }

  const globalName = map[entryName];

  if (globalName) {
    return globalName;
  }

  throw new Error(`Please configure a UMD global name for the "${entryName}" entry.`)
}

const browserUmds = Object.entries(base.entry).map(buildBrowserUmd)

const browserEsm = {
  ...browserBase,
  target: 'web',
  output: {
    filename: (data) => `${getFileName(data)}.esm.js`,
    path: path.resolve(__dirname, 'dist/browser'),
    library: {type: 'module'},
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    ...base.resolve,
    alias: browserAlias(),
  },
};

const browserEsmDev = {
  ...browserEsm,
  output: {
    ...browserEsm.output,
    path: path.resolve(__dirname, '../atomic/src/external-builds/')
  },
  watch: true,
}

const nodeBase = {
  ...base,
  optimization: {
    minimize: false,
  }
}

const nodeCjs = {
  ...nodeBase,
  target: 'node',
  output: {
    filename: (data) => `${getFileName(data)}.js`,
    path: path.resolve(__dirname, 'dist/'),
    library: {type: 'commonjs'},
  },
};

const nodeEsm = {
  ...nodeBase,
  target: 'node14',
  output: {
    filename: (data) => `${getFileName(data)}.esm.js`,
    path: path.resolve(__dirname, 'dist/'),
    library: {type: 'module'},
  },
  experiments: {
    outputModule: true,
  },
};

const isProduction = getMode() === 'production';

module.exports = isProduction ? [...browserUmds, browserEsm, nodeCjs, nodeEsm] : [browserEsmDev];

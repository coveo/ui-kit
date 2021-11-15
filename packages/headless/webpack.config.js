const path = require('path');
const fs = require('fs');
const ReplacePlugin = require('webpack-plugin-replace');


const base = {
  mode: 'production',
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
  devtool: 'source-map',
  // plugins: [
  //   replace(),
  // ]
};

const browserUmd = {
  ...base,
  target: 'web',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: {
      type: 'umd',
      name: 'CoveoHeadless'
    },
  },
  resolve: {
    ...base.resolve,
    alias: browserAlias()
  }
}

const browserEsm = {
  ...base,
  target: 'web',
  output: {
    filename: '[name].esm.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: {type: 'module'},
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    ...base.resolve,
    alias: browserAlias()
  }
}

function browserAlias() {
  return {
    'coveo.analytics': path.resolve(__dirname, './node_modules/coveo.analytics/dist/library.es.js'),
    'cross-fetch': path.resolve(__dirname, './fetch-ponyfill.js'),
    'web-encoding': path.resolve(__dirname, './node_modules/web-encoding/src/lib.js'),
  }
}

function replace() {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  return new ReplacePlugin({
    values: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.VERSION': JSON.stringify(version)
    }
  })
}


const nodeCjs = {
  ...base,
  target: 'node',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/'),
    library: {type: 'commonjs'},
  },
}

const nodeEsm = {
  ...base,
  target: 'node14',
  mode: 'development',
  output: {
    filename: '[name].esm.js',
    path: path.resolve(__dirname, 'dist/'),
    library: {type: 'module'},
  },
  experiments: {
    outputModule: true,
  },
}

module.exports =  [browserUmd, browserEsm, nodeCjs, nodeEsm]
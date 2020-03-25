const path = require('path');
const merge = require('webpack-merge');
const analyze = process.argv.indexOf('analyze') !== -1;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const additionalClientPlugins = [];
if (analyze) {
  additionalClientPlugins.push(new BundleAnalyzerPlugin());
}

const commonConfig = {
  entry: {
    index: './src/index.ts',
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
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    library: 'coveo-headless-engine',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
};

const clientConfig = merge(commonConfig, {
  target: 'web',
  plugins: [new CleanWebpackPlugin(), ...additionalClientPlugins],
  output: {
    path: path.resolve(__dirname, 'dist/client'),
  },
});

const serverConfig = merge(commonConfig, {
  target: 'node',
  plugins: [new CleanWebpackPlugin()],
  output: {
    path: path.resolve(__dirname, 'dist/server'),
  },
});

module.exports = [clientConfig, serverConfig];

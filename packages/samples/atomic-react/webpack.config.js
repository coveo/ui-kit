const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/App.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/\.tw\.css$/, function (
      resource
    ) {
      resource.request = resource.request + '.js';
    }),
  ],
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public/dist'),
  },
  devServer: {
    static: './public',
    port: '3000',
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      overlay: false,
    },
  },
  mode: 'production',
};

const path = require('path');

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

  experiments: {outputModule: true},
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  output: {
    environment: {module: true},
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

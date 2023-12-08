const { version } = require('./package.json');

module.exports = {
  output: "export",
  assetPrefix: ".",
  reactStrictMode: true,
  transpilePackages: [],
  env: {
    version,
  },
};

module.exports = {
  rewrite: [
    {from: '/headless/v([.0-9]*)/(.*)', to: '/headless/$2'},
    {from: '/bueno/v([.0-9]*)/(.*)', to: '/bueno/$2'},
  ],
  directory: 'dist-storybook',
  port: 4400,
};

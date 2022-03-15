const {defineConfig} = require('@vue/cli-service');
module.exports = defineConfig({
  chainWebpack: (config) => {
    config.module
      .rule('html')
      .test(/\.html$/)
      .use('html-loader')
      .loader('html-loader');

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('atomic-'),
        },
      }));
  },
  transpileDependencies: true,
});

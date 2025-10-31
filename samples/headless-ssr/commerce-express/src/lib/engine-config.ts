import {
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

export const engineConfig = {
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    searchBox: defineSearchBox(),
    summary: defineSummary(),
    productList: defineProductList(),
  },
};

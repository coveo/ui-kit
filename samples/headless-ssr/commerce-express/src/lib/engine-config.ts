import {
  type CommerceEngineDefinitionOptions,
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

export const engineConfig: CommerceEngineDefinitionOptions = {
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    searchBox: defineSearchBox(),
    summary: defineSummary(),
    productList: defineProductList(),
  },
};

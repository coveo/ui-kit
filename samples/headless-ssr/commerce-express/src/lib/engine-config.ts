import {
  type CommerceEngineDefinitionOptions,
  defineParameterManager,
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

export const engineConfig: CommerceEngineDefinitionOptions = {
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    productList: defineProductList(),
    summary: defineSummary(),
    searchBox: defineSearchBox(),
    parameterManager: defineParameterManager(),
  },
};

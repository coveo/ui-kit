import {
  type CommerceEngineDefinitionOptions,
  defineCommerceEngine,
  defineParameterManager,
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

const config: CommerceEngineDefinitionOptions = {
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    productList: defineProductList(),
    summary: defineSummary(),
    searchBox: defineSearchBox(),
    parameterManager: defineParameterManager(),
  },
};

export const engineDefinition = defineCommerceEngine(config);

export type EngineDefinition = typeof engineDefinition.searchEngineDefinition;

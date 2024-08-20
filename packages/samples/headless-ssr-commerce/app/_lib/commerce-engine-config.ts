import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  getSampleCommerceEngineConfiguration,
  defineQuerySummary,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

export default {
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineQuerySummary(),
    productList: defineProductList(),
  },
} satisfies CommerceEngineConfig;

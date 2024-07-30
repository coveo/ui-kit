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

const configuration = {
  ...getSampleCommerceEngineConfiguration(),
  analytics: {
    trackingId: 'sports-ui-samples',
    enabled: false, // TODO: enable analytics
  },
};

export default {
  configuration: configuration,
  controllers: {
    summary: defineQuerySummary(),
    productList: defineProductList(),
  },
} satisfies CommerceEngineConfig;

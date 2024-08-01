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
  },
};

export default {
  configuration: {
    ...configuration,
    context: {
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: 'https://sports.barca.group/browse/promotions/skis-boards/surfboards',
      },
    },
  },
  controllers: {
    summary: defineQuerySummary(),
    productList: defineProductList(),
  },
} satisfies CommerceEngineConfig;

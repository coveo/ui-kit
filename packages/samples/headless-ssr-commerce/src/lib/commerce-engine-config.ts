import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductListing,
  getSampleCommerceEngineConfiguration,
  defineQuerySummary,
  defineCart,
  defineSearchBox,
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
    productListing: defineProductListing(),
    cart: defineCart(),
    searchBox: defineSearchBox(),
  },
} satisfies CommerceEngineConfig;

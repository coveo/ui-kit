import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

export default {
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: '...',
      },
    },
  },
  controllers: {
    productList: defineProductList(),
  },
} satisfies CommerceEngineConfig;

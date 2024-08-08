import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  defineQuerySummary,
  getSampleCommerceEngineConfiguration,
  defineRecommendations,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

const {context, ...restOfConfiguration} =
  getSampleCommerceEngineConfiguration();

export default {
  configuration: {
    analytics: {trackingId: 'sports-ui-samples', enabled: false},
    context: {
      ...context,
      view: {
        url: 'https://sports.barca.group',
      },
    },
    ...restOfConfiguration,
  },
  controllers: {
    summary: defineQuerySummary(),
    productList: defineProductList(),
    popularViewedRecs: defineRecommendations({
      options: {
        slotId: 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
      },
    }),
    doNotRefresh: defineRecommendations({
      options: {
        slotId: 'xxx--xxx-xxx-xxxx',
      },
    }),
    popularBoughtRecs: defineRecommendations({
      options: {
        slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
      },
    }),
  },
} satisfies CommerceEngineConfig;

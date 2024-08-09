import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  defineQuerySummary,
  defineCart,
  defineSearchBox,
  defineContext,
  defineRecentQueriesList,
  defineNotifyTrigger,
  defineQueryTrigger,
  defineRedirectionTrigger,
  defineStandaloneSearchBox,
  defineInstantProducts,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

export default {
  configuration: {
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
    analytics: {
      trackingId: 'sports-ui-samples',
    },
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://sports.barca.group',
      },
    },
    cart: {
      items: [
        {
          productId: 'SP01057_00001',
          quantity: 1,
          name: 'Kayaker Canoe',
          price: 800,
        },
        {
          productId: 'SP00081_00001',
          quantity: 1,
          name: 'Bamboo Canoe Paddle',
          price: 120,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
      ],
    },
  },
  controllers: {
    summary: defineQuerySummary(),
    productList: defineProductList(),
    cart: defineCart(),
    searchBox: defineSearchBox(),
    context: defineContext(),
    recentQueriesList: defineRecentQueriesList(),
    notifyTrigger: defineNotifyTrigger(),
    queryTrigger: defineQueryTrigger(),
    redirectionTrigger: defineRedirectionTrigger(),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {redirectionUrl: '/search'},
    }),
    instantProducts: defineInstantProducts({options: {}}),
  },
} satisfies CommerceEngineConfig;

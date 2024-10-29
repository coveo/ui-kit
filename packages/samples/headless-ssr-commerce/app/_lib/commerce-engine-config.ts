import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  defineCart,
  defineSearchBox,
  defineContext,
  defineRecentQueriesList,
  defineNotifyTrigger,
  defineQueryTrigger,
  defineRedirectionTrigger,
  defineStandaloneSearchBox,
  defineInstantProducts,
  defineSummary,
  definePagination,
  defineFacetGenerator,
  defineSort,
  defineProductView,
  getSampleCommerceEngineConfiguration,
  defineDidYouMean,
  defineRecommendations, //defineParameterManager,
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
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
    },
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
    popularViewedRecs: defineRecommendations({
      options: {
        slotId: 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
      },
    }),
    popularBoughtRecs: defineRecommendations({
      options: {
        slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
      },
    }),
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
    pagination: definePagination({options: {pageSize: 9}}),
    sort: defineSort(),
    productView: defineProductView(),
    didYouMean: defineDidYouMean(), // TODO KIT-3463: implement did you mean in sample
    //parameterManager: defineParameterManager(), // TODO KIT-3462: implement parameter manager in sample
    facetGenerator: defineFacetGenerator(),
  },
} satisfies CommerceEngineConfig;

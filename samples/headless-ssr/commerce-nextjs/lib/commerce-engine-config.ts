import {
  type CommerceEngineDefinitionOptions,
  defineBreadcrumbManager,
  defineCart,
  defineContext,
  defineDidYouMean,
  defineFacetGenerator,
  defineInstantProducts,
  definePagination,
  defineParameterManager,
  defineProductList,
  defineRecentQueriesList,
  defineRecommendations,
  defineSearchBox,
  defineSort,
  defineStandaloneSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce';

export default {
  // By default, the logger level is set to 'warn'. To get more detailed error
  // messages while debugging, set it to a more verbose level such as 'debug'.
  // loggerOptions: {level: 'debug'},
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList({enableResults: true}),
    popularViewed: defineRecommendations({
      options: {
        slotId: 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
      },
    }),
    popularBought: defineRecommendations({
      options: {
        slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
      },
    }),
    cart: defineCart(),
    searchBox: defineSearchBox({options: {enableResults: true}}),
    context: defineContext(),
    recentQueriesList: defineRecentQueriesList({
      options: {enableResults: true},
    }),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {redirectionUrl: '/search'},
    }),
    instantProducts: defineInstantProducts(),
    pagination: definePagination({options: {pageSize: 9}}),
    sort: defineSort(),
    didYouMean: defineDidYouMean({enableResults: true}),
    parameterManager: defineParameterManager(),
    facetGenerator: defineFacetGenerator(),
    breadcrumbManager: defineBreadcrumbManager(),
  },
} satisfies CommerceEngineDefinitionOptions;

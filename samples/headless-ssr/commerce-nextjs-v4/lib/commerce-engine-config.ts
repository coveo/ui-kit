import {
  type CommerceEngineDefinitionOptions,
  defineBreadcrumbManager,
  defineDidYouMean,
  defineFacetGenerator,
  defineInstantProducts,
  defineNotifyTrigger,
  definePagination,
  defineProductList,
  defineProductView,
  defineQueryTrigger,
  defineRecentQueriesList,
  defineRecommendations,
  defineRedirectionTrigger,
  defineSearchBox,
  defineSort,
  defineStandaloneSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce-next';

export default {
  // By default, the logger level is set to 'warn'. This level may not provide enough information for some server-side errors. To get more detailed error messages, set the logger level to a more verbose level, such as 'debug'.
  // loggerOptions: {level: 'debug'},
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
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
    viewedTogether: defineRecommendations({
      options: {
        slotId: 'ff5d8804-d398-4dd5-b68c-6a729c66454b',
      },
    }),
    searchBox: defineSearchBox(),
    recentQueriesList: defineRecentQueriesList(),
    notifyTrigger: defineNotifyTrigger(),
    queryTrigger: defineQueryTrigger(),
    redirectionTrigger: defineRedirectionTrigger(),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {redirectionUrl: '/search'},
    }),
    instantProducts: defineInstantProducts(),
    pagination: definePagination({options: {pageSize: 9}}),
    sort: defineSort(),
    productView: defineProductView(),
    didYouMean: defineDidYouMean(),
    facetGenerator: defineFacetGenerator(),
    breadcrumbManager: defineBreadcrumbManager(),
  },
} satisfies CommerceEngineDefinitionOptions;

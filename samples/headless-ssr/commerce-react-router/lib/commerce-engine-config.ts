import {
  type CommerceEngineDefinitionOptions,
  defineBreadcrumbManager,
  defineCart,
  defineContext,
  defineDidYouMean,
  defineFacetGenerator,
  defineInstantProducts,
  defineNotifyTrigger,
  definePagination,
  defineParameterManager,
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
} from '@coveo/headless-react/ssr-commerce';
import {fetchToken} from './fetch-token.js';

const getAccessToken = async (usePublicApiKey: boolean) => {
  return usePublicApiKey || typeof window !== 'undefined'
    ? await fetchToken(usePublicApiKey)
    : '';
};

export default {
  /**
   * By default, the logger level is set to 'warn'. This level may not provide enough information for some server-side
   * errors. To get more detailed error messages, set the logger level to a more verbose level, such as 'debug'.
   */
  //loggerOptions: {level: 'debug'},
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
    accessToken: await getAccessToken(true),
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
    instantProducts: defineInstantProducts(),
    pagination: definePagination(),
    sort: defineSort(),
    productView: defineProductView(),
    didYouMean: defineDidYouMean(),
    parameterManager: defineParameterManager(),
    facetGenerator: defineFacetGenerator(),
    breadcrumbManager: defineBreadcrumbManager(),
  },
} satisfies CommerceEngineDefinitionOptions;

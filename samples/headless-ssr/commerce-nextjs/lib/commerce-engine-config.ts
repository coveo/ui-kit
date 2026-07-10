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
    // Used internally in https://github.com/coveo/ui-kit for testing purposes, not needed in your own implementation.
    // When NEXT_PUBLIC_MOCK_API_URL is set (e.g. during e2e tests), route all API calls
    // through the local @mswjs/http-middleware mock server.
    ...(process.env.NEXT_PUBLIC_MOCK_API_URL && {
      proxyBaseUrl: `${process.env.NEXT_PUBLIC_MOCK_API_URL}/rest/organizations/${getSampleCommerceEngineConfiguration().organizationId}/commerce/v2`,
    }),
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
    searchBox: defineSearchBox({
      options: {
        enableResults: true,
        highlightOptions: {
          exactMatchDelimiters: {open: '<strong>', close: '</strong>'},
        },
      },
    }),
    context: defineContext(),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {
        redirectionUrl: '/search',
        highlightOptions: {
          exactMatchDelimiters: {open: '<strong>', close: '</strong>'},
        },
      },
    }),
    instantProducts: defineInstantProducts(),
    pagination: definePagination({options: {pageSize: 15}}),
    sort: defineSort(),
    didYouMean: defineDidYouMean(),
    parameterManager: defineParameterManager(),
    facetGenerator: defineFacetGenerator(),
    breadcrumbManager: defineBreadcrumbManager(),
  },
} satisfies CommerceEngineDefinitionOptions;

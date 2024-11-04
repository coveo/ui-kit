import {
  CommerceEngine,
  CommerceEngineDefinitionOptions,
  Controller,
  ControllerDefinitionsMap,
  defineBreadcrumbManager,
  defineCart,
  defineCommerceEngine,
  defineContext,
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
} from '@coveo/headless-react/ssr-commerce';

//Why is this not exported ?
type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

export async function getEngineDefinition(useCase: 'listing' | 'search') {
  //TODO: create a cart API route that returns the cart state
  const cartInitialState = {
    items: [
      {
        productId: 'SP01057_00001',
        quantity: 1,
        name: 'Kayaker Canoe',
        price: 800,
      },
    ],
  };

  const config = {
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
      cart: defineCart({initialState: cartInitialState}),
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
      didYouMean: defineDidYouMean(),
      facetGenerator: defineFacetGenerator(),
      breadcrumbManager: defineBreadcrumbManager(),
    },
  } satisfies CommerceEngineConfig;

  const engineDefinition = defineCommerceEngine(config);

  return useCase === 'listing'
    ? engineDefinition.listingEngineDefinition
    : engineDefinition.searchEngineDefinition;
}

export async function getHooks() {
  const cartInitialState = {
    items: [
      {
        productId: 'SP01057_00001',
        quantity: 1,
        name: 'Kayaker Canoe',
        price: 800,
      },
    ],
  };

  const config = {
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
      cart: defineCart({initialState: cartInitialState}),
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
      didYouMean: defineDidYouMean(),
      facetGenerator: defineFacetGenerator(),
      breadcrumbManager: defineBreadcrumbManager(),
    },
  } satisfies CommerceEngineConfig;

  const engineDefinition = defineCommerceEngine(config);

  return engineDefinition.controllers;
}

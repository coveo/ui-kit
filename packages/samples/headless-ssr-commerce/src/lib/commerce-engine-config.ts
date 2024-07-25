import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductListing,
  defineStandaloneSearchBox,
  defineContext,
  getSampleCommerceEngineConfiguration,
  defineFacets,
  defineQuerySummary,
  defineSearchBox,
  defineSearch,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

const configuration = {
  ...getSampleCommerceEngineConfiguration(),
  analytics: {
    trackingId: 'sports',
    enabled: false, // TODO: setup navigatorContext
  },
};

export const masterEngineConfig = {
  configuration: configuration,
  controllers: {
    context: defineContext(),
    searchBox: defineSearchBox({options: {}}),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {redirectionUrl: '/search'},
    }),
    search: defineSearch(),
    productList: defineProductListing(), // TODO: also need to know how to configure a search page
    summary: defineQuerySummary(),
    facets: defineFacets(),
  },
} satisfies CommerceEngineConfig;

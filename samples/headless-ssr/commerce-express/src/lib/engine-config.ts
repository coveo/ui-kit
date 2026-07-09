import {
  type CommerceEngineDefinitionOptions,
  defineContext,
  defineFacetGenerator,
  definePagination,
  defineParameterManager,
  defineProductList,
  defineSearchBox,
  defineSort,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce';

export const engineConfig = {
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    // `context` and `parameterManager` require props at fetch time (see
    // `server.ts`). The remaining controllers are seeded from the fetched
    // static state and hydrated on the client.
    context: defineContext(),
    parameterManager: defineParameterManager(),
    searchBox: defineSearchBox(),
    summary: defineSummary(),
    productList: defineProductList(),
    facetGenerator: defineFacetGenerator(),
    sort: defineSort(),
    pagination: definePagination({options: {pageSize: 12}}),
  },
} satisfies CommerceEngineDefinitionOptions;

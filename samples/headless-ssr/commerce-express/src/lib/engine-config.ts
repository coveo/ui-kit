import {
  type CommerceEngineDefinitionOptions,
  defineCart,
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
    // `context`, `parameterManager`, and `cart` require props at fetch time
    // (see `server.ts`). The remaining controllers are seeded from the fetched
    // static state and hydrated on the client.
    context: defineContext(),
    parameterManager: defineParameterManager(),
    // The cart's initial items are restored from the external cart system (a
    // cookie in this sample; see `lib/externalCartApi.ts`) on every request.
    cart: defineCart(),
    searchBox: defineSearchBox(),
    summary: defineSummary(),
    productList: defineProductList(),
    facetGenerator: defineFacetGenerator(),
    sort: defineSort(),
    pagination: definePagination({options: {pageSize: 12}}),
  },
} satisfies CommerceEngineDefinitionOptions;

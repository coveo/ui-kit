import {
  type CommerceEngineDefinitionOptions,
  defineCart,
  defineContext,
  defineFacetGenerator,
  defineInstantProducts,
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
    // The search box surfaces query suggestions as the user types. The
    // `highlightOptions` wrap the part of each suggestion that matches the
    // typed query in `<strong>` tags (see `components/Search.ts`).
    searchBox: defineSearchBox({
      options: {
        highlightOptions: {
          exactMatchDelimiters: {open: '<strong>', close: '</strong>'},
        },
      },
    }),
    // Instant products preview the best matches for the current query (or the
    // highlighted suggestion) inside the search box dropdown. It is search-only
    // in this sample since that is where the search box is hydrated.
    instantProducts: defineInstantProducts(),
    summary: defineSummary(),
    productList: defineProductList(),
    facetGenerator: defineFacetGenerator(),
    sort: defineSort(),
    pagination: definePagination({options: {pageSize: 12}}),
  },
} satisfies CommerceEngineDefinitionOptions;

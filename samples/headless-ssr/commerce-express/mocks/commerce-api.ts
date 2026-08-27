import {commercePaginationTransformer, MockCommerceApi} from '@coveo/platform-mock-api/commerce';

/**
 * Builds the Coveo Commerce API mock used by both mock layers of the e2e suite:
 * the MSW server preloaded into the Express process (`mocks/node.ts`) and the
 * MSW network fixture running in the browser (`e2e/fixtures.ts`).
 *
 * The search and listing endpoints echo the requested `page` and `perPage` back
 * in the response. Without it the mock always answers with `page: 0`, so a
 * `nextPage()` call moves the state to page 2 only until the response lands and
 * resets it — leaving assertions to race the response instead of observing the
 * settled state.
 */
export function createCommerceApi(basePath?: string): MockCommerceApi {
  const api = basePath ? new MockCommerceApi(basePath) : new MockCommerceApi();
  api.searchEndpoint.addRequestTransformer(commercePaginationTransformer);
  api.productListingEndpoint.addRequestTransformer(commercePaginationTransformer);
  return api;
}

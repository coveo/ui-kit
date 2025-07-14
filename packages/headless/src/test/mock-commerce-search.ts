import type {SearchCommerceSuccessResponse} from '../api/commerce/search/response.js';
import type {QuerySearchCommerceAPIThunkReturn} from '../features/commerce/search/search-actions.js';
import {buildFetchProductListingResponse as buildFetchProductsCoreResponse} from './mock-product-listing.js';

export function buildSearchResponse(
  response: Partial<SearchCommerceSuccessResponse> = {},
  originalQuery: string = '',
  queryExecuted: string = ''
): QuerySearchCommerceAPIThunkReturn {
  return {
    response: {
      ...buildFetchProductsCoreResponse(response).response,
      queryCorrection: response.queryCorrection,
    },
    originalQuery,
    queryExecuted,
  };
}

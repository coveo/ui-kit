import {SearchCommerceSuccessResponse} from '../api/commerce/search/response';
import {QuerySearchCommerceAPIThunkReturn} from '../features/commerce/search/search-actions';
import {buildFetchProductListingV2Response as buildFetchProductsCoreResponse} from './mock-product-listing-v2';

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

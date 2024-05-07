import {SearchCommerceSuccessResponse} from '../api/commerce/search/response';
import {QuerySearchCommerceAPIThunkReturn} from '../features/commerce/search/search-actions';
import {buildFetchProductListingV2Response} from './mock-product-listing-v2';

export function buildSearchResponse(
  response: Partial<SearchCommerceSuccessResponse> = {},
  originalQuery: string = ''
): QuerySearchCommerceAPIThunkReturn {
  return {
    response: {
      ...buildFetchProductListingV2Response(response).response,
      queryCorrection: response.queryCorrection,
    },
    originalQuery,
  };
}

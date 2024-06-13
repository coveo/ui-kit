import {SearchCommerceSuccessResponse} from '../api/commerce/search/response';
import {QuerySearchCommerceAPIThunkReturn} from '../features/commerce/search/search-actions';
import {buildFetchProductListingResponse as buildFetchProductsCoreResponse} from './mock-product-listing';

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

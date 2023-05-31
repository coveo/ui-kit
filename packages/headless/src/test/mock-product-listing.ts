import {ProductListingSuccessResponse} from '../api/commerce/product-listings/product-listing-request';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {FetchProductListingThunkReturn} from '../features/product-listing/product-listing-actions';

export function buildFetchProductListingResponse(
  response: Partial<ProductListingSuccessResponse> = {}
): FetchProductListingThunkReturn {
  return {
    response: {
      pagination: {
        totalCount: 0,
        ...(response?.pagination || {}),
      },
      facets: {
        results: [],
        ...(response?.facets || {}),
      },
      products: [],
      responseId: '',
      ...(response || {}),
    },
    analyticsAction: logInterfaceLoad(),
  };
}

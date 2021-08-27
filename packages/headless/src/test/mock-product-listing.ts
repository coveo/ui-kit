import {ProductListingSuccessResponse} from '../api/commerce/product-listings/product-listing-request';
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
      products: [],
      responseId: '',
      ...(response || {}),
    },
  };
}

import {ProductListingV2SuccessResponse} from '../api/commerce/product-listings/v2/product-listing-v2-response';
import {FetchProductListingV2ThunkReturn} from '../features/product-listing/v2/product-listing-v2-actions';
import {logProductListingV2Load} from '../features/product-listing/v2/product-listing-v2-analytics';
import {SortBy} from '../features/sort/sort';

export function buildFetchProductListingV2Response(
  response: Partial<ProductListingV2SuccessResponse> = {}
): FetchProductListingV2ThunkReturn {
  return {
    response: {
      sort: response.sort ?? {
        appliedSort: {by: SortBy.Relevance},
        availableSorts: [{by: SortBy.Relevance}],
      },
      pagination: response.pagination ?? {
        page: 0,
        perPage: 0,
        totalCount: 0,
        totalPages: 0,
      },
      facets: response.facets ?? [],
      products: response.products ?? [],
      responseId: response.responseId ?? '',
    },
    analyticsAction: logProductListingV2Load(),
  };
}

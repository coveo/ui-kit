import {ProductListingV2SuccessResponse} from '../api/commerce/product-listings/v2/product-listing-v2-response.js';
import {FetchProductListingV2ThunkReturn} from '../features/commerce/product-listing/product-listing-actions.js';
import {logProductListingV2Load} from '../features/commerce/product-listing/product-listing-analytics.js';
import {SortBy} from '../features/sort/sort.js';

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

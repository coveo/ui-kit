import type {ListingCommerceSuccessResponse} from '../api/commerce/listing/response.js';
import type {QueryCommerceAPIThunkReturn} from '../features/commerce/product-listing/product-listing-actions.js';
import {SortBy} from '../features/sort/sort.js';

export function buildFetchProductListingResponse(
  response: Partial<ListingCommerceSuccessResponse> = {}
): QueryCommerceAPIThunkReturn {
  return {
    response: {
      sort: response.sort ?? {
        appliedSort: {sortCriteria: SortBy.Relevance},
        availableSorts: [{sortCriteria: SortBy.Relevance}],
      },
      pagination: response.pagination ?? {
        page: 0,
        perPage: 0,
        totalEntries: 0,
        totalPages: 0,
      },
      facets: response.facets ?? [],
      products: response.products ?? [],
      results: response.results ?? [],
      responseId: response.responseId ?? '',
      triggers: response.triggers ?? [],
    },
  };
}

import {CommerceSuccessResponse} from '../api/commerce/common/response.js';
import {QueryCommerceAPIThunkReturn} from '../features/commerce/common/actions.js';
import {SortBy} from '../features/sort/sort.js';

export function buildFetchProductListingResponse(
  response: Partial<CommerceSuccessResponse> = {}
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
      responseId: response.responseId ?? '',
      triggers: response.triggers ?? [],
    },
  };
}

import {CommerceSuccessResponse} from '../api/commerce/common/response';
import {QueryCommerceAPIThunkReturn} from '../features/commerce/common/actions';
import {logProductListingV2Load} from '../features/commerce/product-listing/product-listing-analytics';
import {SortBy} from '../features/sort/sort';

export function buildFetchProductListingV2Response(
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
    },
    analyticsAction: logProductListingV2Load(),
  };
}

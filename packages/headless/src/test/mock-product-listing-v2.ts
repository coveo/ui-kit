import {ProductListingV2SuccessResponse} from '../api/commerce/product-listings/v2/product-listing-v2-request';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {FetchProductListingV2ThunkReturn} from '../features/product-listing/v2/product-listing-v2-actions';
import {SortBy} from '../features/sort/sort';

export function buildFetchProductListingV2Response(
  response: Partial<ProductListingV2SuccessResponse> = {}
): FetchProductListingV2ThunkReturn {
  return {
    response: {
      listingId: response.listingId ?? '',
      locale: response.locale ?? '',
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
      ...(response || {}),
    },
    analyticsAction: logInterfaceLoad(),
  };
}

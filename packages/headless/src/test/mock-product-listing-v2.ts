import {ProductListingV2SuccessResponse} from '../api/commerce/product-listings/v2/product-listing-v2-response';
import {FetchProductListingV2ThunkReturn} from '../features/commerce/product-listing/product-listing-actions';
import {logProductListingV2Load} from '../features/commerce/product-listing/product-listing-analytics';
import {buildRelevanceSortCriterion} from '../features/commerce/product-listing/sort/product-listing-sort';

export function buildFetchProductListingV2Response(
  response: Partial<ProductListingV2SuccessResponse> = {}
): FetchProductListingV2ThunkReturn {
  return {
    response: {
      sort: response.sort ?? {
        appliedSort: buildRelevanceSortCriterion(),
        availableSorts: [buildRelevanceSortCriterion()],
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

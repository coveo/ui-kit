import {ProductListingSuccessResponse} from '../api/commerce/product-listings/product-listing-request.js';
import {logInterfaceLoad} from '../features/analytics/analytics-actions.js';
import {FetchProductListingThunkReturn} from '../features/product-listing/product-listing-actions.js';
import {buildRelevanceSortCriterion} from '../features/sort/sort.js';

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
      sort: {
        appliedSort: buildRelevanceSortCriterion(),
        availableSorts: [],
        ...(response?.sort || []),
      },
      products: [],
      responseId: '',
      ...(response || {}),
    },
    analyticsAction: logInterfaceLoad(),
  };
}

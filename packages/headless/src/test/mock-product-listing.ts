import {ProductListingSuccessResponse} from '../api/commerce/product-listings/product-listing-request';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {FetchProductListingThunkReturn} from '../features/product-listing/product-listing-actions';
import {buildRelevanceSortCriterion} from '../features/sort/sort';

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

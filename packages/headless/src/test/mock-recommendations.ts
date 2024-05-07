import {RecommendationsCommerceSuccessResponse} from '../api/commerce/recommendations/recommendations-response';
import {QueryRecommendationsCommerceAPIThunkReturn} from '../features/commerce/recommendations/recommendations-actions';

export function buildMockRecommendationsResponse(
  response: Partial<RecommendationsCommerceSuccessResponse> = {}
): QueryRecommendationsCommerceAPIThunkReturn {
  return {
    response: {
      headline: response.headline ?? '',
      pagination: response.pagination ?? {
        page: 0,
        perPage: 0,
        totalEntries: 0,
        totalPages: 0,
      },
      products: response.products ?? [],
      responseId: response.responseId ?? '',
    },
  };
}

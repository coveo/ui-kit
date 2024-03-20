import {RecommendationCommerceSuccessResponse} from '../api/commerce/common/response';
import {QueryRecommendationCommerceAPIThunkReturn} from '../features/commerce/common/actions';

export function buildFetchRecommendationV2Response(
  response: Partial<RecommendationCommerceSuccessResponse> = {}
): QueryRecommendationCommerceAPIThunkReturn {
  return {
    response: {
      headline: response.headline ?? '',
      pagination: response.pagination ?? {
        page: 0,
        perPage: 0,
        totalCount: 0,
        totalPages: 0,
      },
      products: response.products ?? [],
      responseId: response.responseId ?? '',
    },
  };
}

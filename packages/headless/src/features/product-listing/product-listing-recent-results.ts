import {createAction} from '../..';
import {validateProductRecommendationPayload} from '../analytics/analytics-utils';
import {ProductRecommendation} from './../../api/search/search/product-recommendation';

export const pushRecentResult = createAction(
  'recentResults/pushRecentResult',
  (payload: ProductRecommendation) => {
    validateProductRecommendationPayload(payload);
    return {
      payload,
    };
  }
);

import {createAction} from '../../index.js';
import {validateProductRecommendationPayload} from '../analytics/analytics-utils.js';
import {ProductRecommendation} from './../../api/search/search/product-recommendation.js';

export const pushRecentResult = createAction(
  'recentResults/pushRecentResult',
  (payload: ProductRecommendation) => {
    validateProductRecommendationPayload(payload);
    return {
      payload,
    };
  }
);

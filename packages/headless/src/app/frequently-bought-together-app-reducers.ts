import {ReducersMapObject} from 'redux';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {
  configuration,
  productRecommendations,
  context,
  searchHub,
  version,
} from './reducers';

/**
 * Map of reducers that make up the ProductRecommendationsAppState.
 *
 * @deprecated - Please use `buildProductRecommendationEngine` instead of `HeadlessEngine` to instantiate an engine. The new approach configures reducers behind the scenes, so `productRecommendationsAppReducers` is no longer needed and will be removed in the next major version.
 */
export const productRecommendationsAppReducers: ReducersMapObject<ProductRecommendationsAppState> = {
  configuration,
  productRecommendations,
  context,
  searchHub,
  version,
};

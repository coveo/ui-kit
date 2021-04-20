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
 */
export const productRecommendationsAppReducers: ReducersMapObject<ProductRecommendationsAppState> = {
  configuration,
  productRecommendations,
  context,
  searchHub,
  version,
};

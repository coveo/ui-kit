import {ReducersMapObject} from 'redux';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {contextReducer} from '../features/context/context-slice';
import {versionReducer} from '../features/debug/version-slice';
import {productRecommendationsReducer} from '../features/product-recommendations/product-recommendations-slice';
import {searchHubReducer} from '../features/search-hub/search-hub-slice';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';

/**
 * Map of reducers that make up the ProductRecommendationsAppState.
 */
export const productRecommendationsAppReducers: ReducersMapObject<ProductRecommendationsAppState> = {
  configuration: configurationReducer,
  productRecommendations: productRecommendationsReducer,
  context: contextReducer,
  searchHub: searchHubReducer,
  version: versionReducer,
};

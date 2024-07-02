import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';
import {productRecommendationsReducer as productRecommendations} from '../../features/product-recommendations/product-recommendations-slice';
import {
  getProductRecommendations,
  GetProductRecommendationsThunkReturn,
  setProductRecommendationsAdditionalFields,
  SetProductRecommendationsAdditionalFieldsActionCreatorPayload,
  setProductRecommendationsBrandFilter,
  SetProductRecommendationsBrandFilterActionCreatorPayload,
  setProductRecommendationsCategoryFilter,
  SetProductRecommendationsCategoryFilterActionCreatorPayload,
  setProductRecommendationsMaxNumberOfRecommendations,
  SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload,
  setProductRecommendationsRecommenderId,
  SetProductRecommendationsRecommenderIdActionCreatorPayload,
  setProductRecommendationsSkus,
  SetProductRecommendationsSkusActionCreatorPayload,
  StateNeededByGetProductRecommendations,
} from './product-recommendations-actions';

export type {
  SetProductRecommendationsAdditionalFieldsActionCreatorPayload,
  SetProductRecommendationsBrandFilterActionCreatorPayload,
  SetProductRecommendationsCategoryFilterActionCreatorPayload,
  SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload,
  SetProductRecommendationsRecommenderIdActionCreatorPayload,
  SetProductRecommendationsSkusActionCreatorPayload,
};

/**
 * The product recommendations action creators.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductRecommendationsActionCreators {
  /**
   * Refreshes the product recommendations.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @returns A dispatchable action.
   */
  getProductRecommendations(): AsyncThunkAction<
    GetProductRecommendationsThunkReturn,
    void,
    AsyncThunkSearchOptions<StateNeededByGetProductRecommendations>
  >;

  /**
   * Updates the additional requested result fields.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsAdditionalFields(
    payload: SetProductRecommendationsAdditionalFieldsActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsAdditionalFieldsActionCreatorPayload>;

  /**
   * Updates the brand used to filter recommendations.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsBrandFilter(
    payload: SetProductRecommendationsBrandFilterActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsBrandFilterActionCreatorPayload>;

  /**
   * Updates the category used to filter recommendations.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsCategoryFilter(
    payload: SetProductRecommendationsCategoryFilterActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsCategoryFilterActionCreatorPayload>;

  /**
   * Updates the maximum number of recommendations to return.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsMaxNumberOfRecommendations(
    payload: SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload>;

  /**
   * Updates the recommender id, used to determine the machine-learning model that should fulfill the request.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsRecommenderId(
    payload: SetProductRecommendationsRecommenderIdActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsRecommenderIdActionCreatorPayload>;

  /**
   * Updates the skus for which to retrieve recommendations.
   *
   * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductRecommendationsSkus(
    payload: SetProductRecommendationsSkusActionCreatorPayload
  ): PayloadAction<SetProductRecommendationsSkusActionCreatorPayload>;
}

/**
 * Loads the `productRecommendations` reducer and returns possible action creators.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadProductRecommendationsActions(
  engine: ProductRecommendationEngine
): ProductRecommendationsActionCreators {
  engine.addReducers({productRecommendations});

  return {
    getProductRecommendations,
    setProductRecommendationsAdditionalFields,
    setProductRecommendationsBrandFilter,
    setProductRecommendationsCategoryFilter,
    setProductRecommendationsMaxNumberOfRecommendations,
    setProductRecommendationsRecommenderId,
    setProductRecommendationsSkus,
  };
}

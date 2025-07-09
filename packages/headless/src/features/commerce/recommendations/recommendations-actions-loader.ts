import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type FetchMoreRecommendationsPayload,
  type FetchRecommendationsPayload,
  fetchMoreRecommendations,
  fetchRecommendations,
  type PromoteChildToParentPayload,
  promoteChildToParent,
  type QueryRecommendationsCommerceAPIThunkReturn,
  type RegisterRecommendationsSlotPayload,
  registerRecommendationsSlot,
  type StateNeededByFetchRecommendations,
} from './recommendations-actions.js';
import {recommendationsReducer as recommendations} from './recommendations-slice.js';

export type {
  RegisterRecommendationsSlotPayload,
  FetchRecommendationsPayload,
  FetchMoreRecommendationsPayload,
};

/**
 * The recommendations action creators.
 *
 * @group Actions
 * @category Recommendations
 */
export interface RecommendationsActionCreator {
  /**
   * Fetches recommendations.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchRecommendations(
    payload: FetchRecommendationsPayload
  ): AsyncThunkAction<
    QueryRecommendationsCommerceAPIThunkReturn,
    FetchRecommendationsPayload,
    AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
  >;

  /**
   * Fetches an additional page of recommendations and appends it to the current list.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchMoreRecommendations(
    payload: FetchMoreRecommendationsPayload
  ): AsyncThunkAction<
    QueryRecommendationsCommerceAPIThunkReturn | null,
    FetchMoreRecommendationsPayload,
    AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
  >;

  /**
   * Promotes a child product to a parent product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  promoteChildToParent(
    payload: PromoteChildToParentPayload
  ): PayloadAction<PromoteChildToParentPayload>;

  /**
   * Registers a recommendations slot.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerRecommendationsSlot(
    payload: RegisterRecommendationsSlotPayload
  ): PayloadAction<RegisterRecommendationsSlotPayload>;
}

/**
 * Loads the commerce recommendations reducer and returns the available recommendations action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the recommendations action creators.
 *
 * @group Actions
 * @category Recommendations
 */
export function loadRecommendationsActions(
  engine: CommerceEngine
): RecommendationsActionCreator {
  engine.addReducers({recommendations});
  return {
    fetchRecommendations,
    fetchMoreRecommendations,
    promoteChildToParent,
    registerRecommendationsSlot,
  };
}

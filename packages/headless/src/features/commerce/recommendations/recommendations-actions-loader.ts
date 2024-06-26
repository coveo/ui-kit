import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  FetchMoreRecommendationsActionCreatorPayload,
  FetchRecommendationsActionCreatorPayload,
  QueryRecommendationsCommerceAPIThunkReturn,
  RegisterRecommendationsSlotActionCreatorPayload,
  StateNeededByFetchRecommendations,
  fetchMoreRecommendations,
  fetchRecommendations,
  registerRecommendationsSlot,
} from './recommendations-actions';
import {recommendationsReducer as recommendations} from './recommendations-slice';

export type {
  RegisterRecommendationsSlotActionCreatorPayload,
  FetchRecommendationsActionCreatorPayload,
  FetchMoreRecommendationsActionCreatorPayload,
};

/**
 * The recommendations action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface RecommendationsActionCreator {
  /**
   * Registers a recommendations slot.
   * @param payload - The action creator payload.
   *
   * @returns A dispatchable action.
   */
  registerRecommendationsSlot(
    payload: RegisterRecommendationsSlotActionCreatorPayload
  ): PayloadAction<RegisterRecommendationsSlotActionCreatorPayload>;
  /**
   * Fetches recommendations.
   * @param payload - The action creator payload.
   *
   * @returns A dispatchable action.
   */
  fetchRecommendations(
    payload: FetchRecommendationsActionCreatorPayload
  ): AsyncThunkAction<
    QueryRecommendationsCommerceAPIThunkReturn,
    FetchRecommendationsActionCreatorPayload,
    AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
  >;

  /**
   * Fetches an additional page of recommendations and appends it to the current list.
   * @param payload - The action creator payload.
   *
   * @returns A dispatchable action.
   */
  fetchMoreRecommendations(
    payload: FetchMoreRecommendationsActionCreatorPayload
  ): AsyncThunkAction<
    QueryRecommendationsCommerceAPIThunkReturn | null,
    FetchMoreRecommendationsActionCreatorPayload,
    AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
  >;

  // TODO KIT-3221 - Expose promoteChildToParent action and action payload creator.
}

/**
 * Loads the recommendations reducer and returns the possible recommendations action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the action creators.
 */
export function loadRecommendationsActions(
  engine: CommerceEngine
): RecommendationsActionCreator {
  engine.addReducers({recommendations});
  return {
    registerRecommendationsSlot,
    fetchRecommendations,
    fetchMoreRecommendations,
  };
}

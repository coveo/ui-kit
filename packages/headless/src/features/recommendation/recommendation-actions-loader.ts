import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import type {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine.js';
import {recommendationReducer as recommendation} from '../../features/recommendation/recommendation-slice.js';
import {
  type GetRecommendationsThunkReturn,
  getRecommendations,
  type SetRecommendationIdActionCreatorPayload,
  type StateNeededByGetRecommendations,
  setRecommendationId,
} from './recommendation-actions.js';

export type {SetRecommendationIdActionCreatorPayload};

/**
 * The recommendation action creators.
 *
 * @group Actions
 * @category Recommendation
 */
export interface RecommendationActionCreators {
  /**
   * Refreshes the recommendations.
   *
   * @returns A dispatchable action.
   */
  getRecommendations(): AsyncThunkAction<
    GetRecommendationsThunkReturn,
    void,
    AsyncThunkSearchOptions<StateNeededByGetRecommendations>
  >;

  /**
   * Updates the recommendation identifier.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setRecommendationId(
    payload: SetRecommendationIdActionCreatorPayload
  ): PayloadAction<SetRecommendationIdActionCreatorPayload>;
}

/**
 * Loads the `recommendation` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category Recommendation
 */
export function loadRecommendationActions(
  engine: RecommendationEngine
): RecommendationActionCreators {
  engine.addReducers({recommendation});

  return {
    getRecommendations,
    setRecommendationId,
  };
}

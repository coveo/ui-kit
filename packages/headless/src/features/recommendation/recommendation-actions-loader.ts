import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine.js';
import {recommendationReducer as recommendation} from '../../features/recommendation/recommendation-slice.js';
import {
  getRecommendations,
  GetRecommendationsThunkReturn,
  StateNeededByGetRecommendations,
  setRecommendationId,
  SetRecommendationIdActionCreatorPayload,
} from './recommendation-actions.js';

export type {SetRecommendationIdActionCreatorPayload};

/**
 * The recommendation action creators.
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

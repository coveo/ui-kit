import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {Engine} from '../../app/headless-engine';
import {recommendation} from '../../app/reducers';
import {
  getRecommendations,
  GetRecommendationsThunkReturn,
  StateNeededByGetRecommendations,
  setRecommendationId,
  SetRecommendationIdActionCreatorPayload,
} from './recommendation-actions';

export {SetRecommendationIdActionCreatorPayload};

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
  engine: Engine<object>
): RecommendationActionCreators {
  engine.addReducers({recommendation});

  return {
    getRecommendations,
    setRecommendationId,
  };
}

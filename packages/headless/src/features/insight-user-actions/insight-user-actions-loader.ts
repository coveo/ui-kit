import {PayloadAction, AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {CoreEngine} from '../../app/engine';
import {insightUserActionsReducer as insightUserActions} from '../../features/insight-user-actions/insight-user-actions-slice';
import {
  registerUserActions,
  fetchUserActions,
  RegisterUserActionsPayload,
  StateNeededByFetchUserActions,
  FetchUserActionsThunkReturn,
} from './insight-user-actions-actions';

export interface InsightUserActionsActionCreators {
  /**
   * Registers the user actions.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerUserActions(
    payload: RegisterUserActionsPayload
  ): PayloadAction<RegisterUserActionsPayload>;

  /**
   * Fetches the user actions.
   *
   * @param userId - The user ID to fetch actions for.
   * @returns A dispatchable action.
   */
  fetchUserActions(
    userId: string
  ): AsyncThunkAction<
    FetchUserActionsThunkReturn,
    string,
    AsyncThunkInsightOptions<StateNeededByFetchUserActions>
  >;
}

/**
 * Loads the `InsightUserActions` reducer and returns possible action creators.
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadInsightUserActionsActions(
  engine: CoreEngine
): InsightUserActionsActionCreators {
  engine.addReducers({insightUserActions});

  return {
    registerUserActions,
    fetchUserActions,
  };
}

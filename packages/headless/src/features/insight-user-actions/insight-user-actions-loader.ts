import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client.js';
import type {CoreEngine} from '../../app/engine.js';
import {insightUserActionsReducer as insightUserActions} from '../../features/insight-user-actions/insight-user-actions-slice.js';
import {
  type FetchUserActionsThunkReturn,
  fetchUserActions,
  type RegisterUserActionsPayload,
  registerUserActions,
  type StateNeededByFetchUserActions,
} from './insight-user-actions-actions.js';

export type {RegisterUserActionsPayload};

/**
 * The Insight user actions action creators.
 *
 * @group Actions
 * @category InsightUserActions
 */
export interface InsightUserActionsActionCreators {
  /**
   * Registers the user actions for a given user ID, ticket creation date, and excluded custom actions.
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
 *
 * @group Actions
 * @category InsightUserActions
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

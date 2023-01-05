import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {insightUserActions} from '../../app/reducers';
import {
  fetchUserActions,
  FetchUserActionsThunkReturn,
  StateNeededByFetchUserActions,
} from './insight-user-actions-actions';

/**
 * The Insight User Actions action creators.
 */
export interface InsightUserActionsActionCreators {
  /**
   * Fetches the User Actions.
   *
   * @returns A dispatchable action.
   */
  fetch(): AsyncThunkAction<
    FetchUserActionsThunkReturn,
    void,
    AsyncThunkInsightOptions<StateNeededByFetchUserActions>
  >;
}

/**
 * Loads the `insightUserActions` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadInsightUserActionsActions(
  engine: InsightEngine
): InsightUserActionsActionCreators {
  engine.addReducers({insightUserActions});

  return {
    fetch: fetchUserActions,
  };
}

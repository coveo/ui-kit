import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {insightInterface} from '../../app/reducers';
import {
  fetchInterface,
  FetchInterfaceThunkReturn,
  StateNeededByFetchInterface,
} from './insight-interface-actions';

/**
 * The Insight interface action creators.
 */
export interface InsightInterfaceActionCreators {
  /**
   * Fetches the Insight interface configuration.
   *
   * @returns A dispatchable action.
   */
  fetch(): AsyncThunkAction<
    FetchInterfaceThunkReturn,
    void,
    AsyncThunkInsightOptions<StateNeededByFetchInterface>
  >;
}

/**
 * Loads the `insightInterface` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadInsightInterfaceActions(
  engine: InsightEngine
): InsightInterfaceActionCreators {
  engine.addReducers({insightInterface});

  return {
    fetch: fetchInterface,
  };
}

import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client.js';
import {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import {
  fetchInterface,
  FetchInterfaceThunkReturn,
  StateNeededByFetchInterface,
} from './insight-interface-actions.js';

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

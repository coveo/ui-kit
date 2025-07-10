import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client.js';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import {
  type FetchInterfaceThunkReturn,
  fetchInterface,
  type StateNeededByFetchInterface,
} from './insight-interface-actions.js';

/**
 * The Insight interface action creators.
 *
 * @group Actions
 * @category InsightInterface
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
 *
 * @group Actions
 * @category InsightInterface
 */
export function loadInsightInterfaceActions(
  engine: InsightEngine
): InsightInterfaceActionCreators {
  engine.addReducers({insightInterface});

  return {
    fetch: fetchInterface,
  };
}

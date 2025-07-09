import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {facetOrderReducer as facetOrder} from '../../features/facets/facet-order/facet-order-slice.js';
import {history} from '../../features/history/history-slice.js';
import {back, forward} from './history-actions.js';

/**
 * The history action creators.
 *
 * @group Actions
 * @category History
 */
export interface HistoryActionCreators {
  /**
   * Moves backward in the interface history.
   *
   * @returns A dispatchable action.
   */
  back(): AsyncThunkAction<void, void, {}>;

  /**
   * Moves forward in the interface history.
   *
   * @returns A dispatchable action.
   */
  forward(): AsyncThunkAction<void, void, {}>;
}

/**
 * Loads the `history` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category History
 */
export function loadHistoryActions(
  engine: SearchEngine
): HistoryActionCreators {
  engine.addReducers({history, facetOrder});

  return {
    back,
    forward,
  };
}

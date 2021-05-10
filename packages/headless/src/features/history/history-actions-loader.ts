import {AsyncThunkAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {history} from '../../app/reducers';
import {back, forward} from './history-actions';

/**
 * The history action creators.
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
 */
export function loadHistoryActions(
  engine: Engine<object>
): HistoryActionCreators {
  engine.addReducers({history});

  return {
    back,
    forward,
  };
}

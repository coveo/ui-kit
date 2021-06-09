import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {debug} from '../../app/reducers';
import {disableDebug, enableDebug} from './debug-actions';

/**
 * The debug action creators.
 */
export interface DebugActionCreators {
  /**
   * Disables debug information on requests.
   *
   * @returns A dispatchable action.
   */
  disableDebug(): PayloadAction;

  /**
   * Enables debug information on requests.
   *
   * @returns A dispatchable action.
   */
  enableDebug(): PayloadAction;
}

/**
 * Loads the `debug` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadDebugActions(engine: CoreEngine): DebugActionCreators {
  engine.addReducers({debug});

  return {
    disableDebug,
    enableDebug,
  };
}

import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import {disableDebug, enableDebug} from './debug-actions.js';

/**
 * The debug action creators.
 *
 * @group Actions
 * @category Debug
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
 *
 * @group Actions
 * @category Debug
 */
export function loadDebugActions(engine: CoreEngine): DebugActionCreators {
  engine.addReducers({debug});

  return {
    disableDebug,
    enableDebug,
  };
}

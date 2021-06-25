import {triggers} from '../../app/reducers';
import {clearQueryTrigger, clearNotifyTrigger} from './trigger-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';

/**
 * The trigger action creators.
 */
export interface TriggerActionCreators {
  /**
   * Clears the trigger query parameter to an empty string.
   */
  clearQueryTrigger(): void;

  /**
   * Clears the trigger notify parameter to an empty string.
   */
  clearNotifyTrigger(): void;
}

/**
 * Loads the `triggers` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadTriggerActions(
  engine: SearchEngine
): TriggerActionCreators {
  engine.addReducers({triggers});

  return {
    clearQueryTrigger,
    clearNotifyTrigger,
  };
}

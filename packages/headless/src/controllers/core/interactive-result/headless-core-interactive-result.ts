import {configuration} from '../../../app/reducers';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {loadReducerError} from '../../../utils/errors';
import {ConfigurationSection} from '../../../state/state-sections';
import {Result} from '../../../api/search/search/result';

export interface InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;

  /**
   * The amount of time to wait before selecting the result after calling `beginDelayedSelect`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface InteractiveResultCoreProps {
  /**
   * The options for the result controller core.
   */
  options: InteractiveResultCoreOptions;
}

/**
 * The `InteractiveResultCore` manages common functionality for interactive result controllers.
 */
export interface InteractiveResultCore {
  /**
   * Selects the result, logging a UA event to the Coveo Platform if the result wasn't selected before.
   *
   * In a DOM context, it's recommended to call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  select(): void;

  /**
   * Prepares to select the result after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, it's recommended to call this method on the `touchstart` event.
   */
  beginDelayedSelect(): void;

  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, it's recommended to call this method on the `touchend` event.
   */
  cancelPendingSelect(): void;
}

/**
 * Creates the result controller core.
 *
 * @param engine - The headless engine.
 * @param props - The configurable controller properties.
 * @param action - The action to be triggered on select.
 * @returns A controller core instance.
 */
export function buildInteractiveResultCore(
  engine: SearchEngine,
  props: InteractiveResultCoreProps,
  action: () => void
): InteractiveResultCore {
  if (!loadInteractiveResultCoreReducers(engine)) {
    throw loadReducerError;
  }

  // 1 second is a reasonable amount of time to catch most longpress actions.
  const defaultDelay = 1000;
  const options: Required<InteractiveResultCoreOptions> = {
    selectionDelay: defaultDelay,
    ...props.options,
  };

  let longPressTimer: NodeJS.Timeout;

  return {
    select: action,

    beginDelayedSelect() {
      longPressTimer = setTimeout(action, options.selectionDelay);
    },

    cancelPendingSelect() {
      longPressTimer && clearTimeout(longPressTimer);
    },
  };
}

function loadInteractiveResultCoreReducers(
  engine: SearchEngine
): engine is SearchEngine<ConfigurationSection> {
  engine.addReducers({configuration});
  return true;
}

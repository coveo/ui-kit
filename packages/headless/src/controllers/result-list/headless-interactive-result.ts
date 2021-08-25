import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';
import {ConfigurationSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';

export interface InteractiveResultOptions {
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

export interface InteractiveResultProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: InteractiveResultOptions;
}

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
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 */
export interface InteractiveResult extends InteractiveResultCore {}

export function buildCoreInteractiveResult(
  engine: SearchEngine,
  props: InteractiveResultProps,
  action: () => void
): InteractiveResultCore {
  if (!loadInteractiveResultReducers(engine)) {
    throw loadReducerError;
  }

  // 1 second is a reasonable amount of time to catch most longpress actions.
  const defaultDelay = 1000;
  const options: Required<InteractiveResultOptions> = {
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

/**
 * Creates an `InteractiveResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 */
export function buildInteractiveResult(
  engine: SearchEngine,
  props: InteractiveResultProps
): InteractiveResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logDocumentOpen(props.options.result));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
    engine.dispatch(pushRecentResult(props.options.result));
  };

  return buildCoreInteractiveResult(engine, props, action);
}

function loadInteractiveResultReducers(
  engine: SearchEngine
): engine is SearchEngine<ConfigurationSection> {
  engine.addReducers({configuration});
  return true;
}

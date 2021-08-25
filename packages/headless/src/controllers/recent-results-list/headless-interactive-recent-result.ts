import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions';
import {ConfigurationSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';

export interface InteractiveRecentResultOptions {
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

export interface InteractiveRecentResultProps {
  /**
   * The options for the `InteractiveRecentResult` controller.
   * */
  options: InteractiveRecentResultOptions;
}

/**
 * The `InteractiveRecentResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a recent query result.
 */
export interface InteractiveRecentResult {
  /**
   * Selects the recent result, logging a UA event to the Coveo Platform.
   *
   * In a DOM context, it's recommended to call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  select(): void;

  /**
   * Prepares to select the result after a certain delay, sending analytics on selection.
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
 * Creates an `InteractiveRecentResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveRecentResult` properties.
 * @returns An `InteractiveRecentResult` controller instance.
 */
export function buildInteractiveRecentResult(
  engine: SearchEngine,
  props: InteractiveRecentResultProps
): InteractiveRecentResult {
  if (!loadInteractiveRecentResultReducers(engine)) {
    throw loadReducerError;
  }

  // 1 second is a reasonable amount of time to catch most longpress actions
  const defaultDelay = 1000;
  const options: Required<InteractiveRecentResultOptions> = {
    selectionDelay: defaultDelay,
    ...props.options,
  };

  const logAnalytics = () => {
    engine.dispatch(logRecentResultClick(options.result));
  };

  let longPressTimer: NodeJS.Timeout;

  return {
    select: logAnalytics,

    beginDelayedSelect() {
      longPressTimer = setTimeout(logAnalytics, options.selectionDelay);
    },

    cancelPendingSelect() {
      longPressTimer && clearTimeout(longPressTimer);
    },
  };
}

function loadInteractiveRecentResultReducers(
  engine: SearchEngine
): engine is SearchEngine<ConfigurationSection> {
  engine.addReducers({configuration});
  return true;
}

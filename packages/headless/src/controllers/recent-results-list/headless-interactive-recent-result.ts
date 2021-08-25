import {SearchEngine} from '../../app/search-engine/search-engine';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions';
import {
  buildCoreInteractiveResult,
  InteractiveResultProps,
} from '../result-list/headless-interactive-result';

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
  props: InteractiveResultProps
): InteractiveRecentResult {
  const action = () =>
    engine.dispatch(logRecentResultClick(props.options.result));
  return buildCoreInteractiveResult(engine, props, action);
}

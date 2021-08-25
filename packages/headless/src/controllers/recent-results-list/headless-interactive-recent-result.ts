import {SearchEngine} from '../../app/search-engine/search-engine';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions';
import {
  buildCoreInteractiveResult,
  InteractiveResultCore,
  InteractiveResultOptions,
} from '../result-list/headless-interactive-result';

/**
 * The `InteractiveRecentResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a recent query result.
 */
export interface InteractiveRecentResult extends InteractiveResultCore {}

export interface InteractiveRecentResultProps {
  /**
   * The options for the `InteractiveRecentResult` controller.
   * */
  options: InteractiveResultOptions;
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
  const action = () =>
    engine.dispatch(logRecentResultClick(props.options.result));
  return buildCoreInteractiveResult(engine, props, action);
}

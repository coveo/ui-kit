import type {Result} from '../../api/search/search/result.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
  type InteractiveResultCoreOptions,
  type InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result.js';

export interface InteractiveRecentResultOptions
  extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;
}

export interface InteractiveRecentResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: InteractiveRecentResultOptions;
}

/**
 * The `InteractiveRecentResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a recent query result.
 *
 * @group Controllers
 * @category InteractiveRecentResult
 */
export interface InteractiveRecentResult extends InteractiveResultCore {}

/**
 * Creates an `InteractiveRecentResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveRecentResult` properties.
 * @returns An `InteractiveRecentResult` controller instance.
 *
 * @group Controllers
 * @category InteractiveRecentResult
 */
export function buildInteractiveRecentResult(
  engine: SearchEngine,
  props: InteractiveRecentResultProps
): InteractiveRecentResult {
  const logAnalytics = () =>
    engine.dispatch(logRecentResultClick(props.options.result));

  return buildInteractiveResultCore(engine, props, logAnalytics);
}

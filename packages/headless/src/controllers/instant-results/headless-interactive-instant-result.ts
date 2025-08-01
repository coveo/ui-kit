import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logInstantResultOpen} from '../../features/instant-results/instant-result-analytics-actions.js';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result.js';
import type {
  InteractiveResult,
  InteractiveResultOptions,
} from '../result-list/headless-interactive-result.js';

export interface InteractiveInstantResultOptions
  extends InteractiveResultOptions {}

export interface InteractiveInstantResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveInstantResult` controller.
   * */
  options: InteractiveInstantResultOptions;
}

/**
 * The `InteractiveInstantResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 *
 * @group Controllers
 * @category InteractiveInstantResult
 */
export interface InteractiveInstantResult extends InteractiveResult {}

/**
 * Creates an `InteractiveInstantResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveInstantResult` properties.
 * @returns An `InteractiveInstantResult` controller instance.
 *
 * @group Controllers
 * @category InteractiveInstantResult
 */
export function buildInteractiveInstantResult(
  engine: SearchEngine,
  props: InteractiveInstantResultProps
): InteractiveInstantResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logInstantResultOpen(props.options.result));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
    engine.dispatch(pushRecentResult(props.options.result));
  };

  return buildInteractiveResultCore(engine, props, action);
}

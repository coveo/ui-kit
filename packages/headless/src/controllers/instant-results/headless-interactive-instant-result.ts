import {SearchEngine} from '../../app/search-engine/search-engine';
import {logInstantResultOpen} from '../../features/instant-results/instant-result-analytics-actions';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result';
import {
  InteractiveResult,
  InteractiveResultOptions,
} from '../result-list/headless-interactive-result';

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
 */
export interface InteractiveInstantResult extends InteractiveResult {}

/**
 * Creates an `InteractiveInstantResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveInstantResult` properties.
 * @returns An `InteractiveInstantResult` controller instance.
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

import {SearchEngine} from '../../app/search-engine/search-engine';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result';

export interface InteractiveResultOptions
  extends InteractiveResultCoreOptions {}

export interface InteractiveResultProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: InteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 */
export interface InteractiveResult extends InteractiveResultCore {}

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

  return buildInteractiveResultCore(engine, props, action);
}

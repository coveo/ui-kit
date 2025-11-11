import type {Result} from '../../api/search/search/result.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions.js';
import {logDocumentOpen} from '../../features/result/result-analytics-actions.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
  type InteractiveResultCoreOptions,
  type InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result.js';

export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;
}

export interface InteractiveResultProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: InteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 *
 * Example: [result-link.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/result-list/result-link.tsx)
 *
 * @group Controllers
 * @category InteractiveResult
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an `InteractiveResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 *
 * @group Controllers
 * @category InteractiveResult
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

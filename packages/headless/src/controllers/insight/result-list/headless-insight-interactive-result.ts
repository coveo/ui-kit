import type {Result} from '../../../api/search/search/result.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions.js';
import {logDocumentOpen} from '../../../features/result/result-insight-analytics-actions.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
  type InteractiveResultCoreOptions,
  type InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result.js';

export type {
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  InteractiveResultCore,
};
export interface InsightInteractiveResultOptions
  extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;
}

export interface InsightInteractiveResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: InsightInteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 *
 * @group Controllers
 * @category InteractiveResult
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an insight `InteractiveResult` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 *
 * @group Controllers
 * @category InteractiveResult
 */
export function buildInteractiveResult(
  engine: InsightEngine,
  props: InsightInteractiveResultProps
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

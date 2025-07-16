import type {Result} from '../../../api/search/search/result.js';
import type {RecommendationEngine} from '../../../app/recommendation-engine/recommendation-engine.js';
import {logRecommendationOpen} from '../../../features/recommendation/recommendation-analytics-actions.js';
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

export interface RecommendationInteractiveResultOptions
  extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;
}

export interface RecommendationInteractiveResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: RecommendationInteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 *
 * @group Controllers
 * @category InteractiveResult
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an recommendation `InteractiveResult` controller instance.
 *
 * @param engine - The recommendation engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 *
 * @group Controllers
 * @category InteractiveResult
 */
export function buildInteractiveResult(
  engine: RecommendationEngine,
  props: RecommendationInteractiveResultProps
): InteractiveResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logRecommendationOpen(props.options.result));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
  };

  return buildInteractiveResultCore(engine, props, action);
}

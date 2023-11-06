import {Result} from '../../../api/search/search/result';
import {RecommendationEngine} from '../../../app/recommendation-engine/recommendation-engine';
import {logRecommendationOpen} from '../../../features/recommendation/recommendation-analytics-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result';

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
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an recommendation `InteractiveResult` controller instance.
 *
 * @param engine - The recommendation engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
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

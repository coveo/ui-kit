import {ProductRecommendation} from '../../../../api/search/search/product-recommendation';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../../../../controllers';
import {buildInteractiveResultCore} from '../../../../controllers/core/interactive-result/headless-core-interactive-result';
import {logProductRecommendationOpen} from '../../product-listing-analytics';
import {pushRecentResult} from '../../product-listing-recent-results';

export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: ProductRecommendation;
}

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
  engine: CommerceEngine,
  props: InteractiveResultProps
): InteractiveResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logProductRecommendationOpen(props.options.result));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
    engine.dispatch(pushRecentResult(props.options.result));
  };

  return buildInteractiveResultCore(engine, props, action);
}

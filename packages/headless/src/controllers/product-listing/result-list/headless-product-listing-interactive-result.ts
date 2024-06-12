import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {logProductRecommendationOpen} from '../../../features/product-listing/product-listing-analytics';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
};

/**
 * @deprecated TBD CAPI-98
 */
export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: ProductRecommendation;
}

/**
 * @deprecated TBD CAPI-98
 */
export interface InteractiveResultProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: InteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 * @deprecated TBD CAPI-98
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an `InteractiveResult` controller instance.
 * @deprecated TBD CAPI-98
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 */
export function buildInteractiveResult(
  engine: ProductListingEngine,
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
  };

  return buildInteractiveResultCore(engine, props, action);
}

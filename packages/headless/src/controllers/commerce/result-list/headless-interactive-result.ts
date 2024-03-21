import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {pushRecentResult} from '../../../features/product-listing/product-listing-recent-results';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result';

export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The product.
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
 * The `InteractiveProduct` controller provides an interface for handling long presses, multiple clicks, etc. to ensure
 * that analytics events are logged properly when a user selects a product.
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an `InteractiveResult` controller instance.
 *
 * @param engine - The headless commerce engine.
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
    // eslint-disable-next-line @cspell/spellchecker
    // TODO LENS-1500: Trigger ec.productClick event
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
    engine.dispatch(pushRecentResult(props.options.result));
  };

  return buildInteractiveResultCore(engine, props, action);
}

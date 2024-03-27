import {Product} from '../../../../api/commerce/common/product';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../../../core/interactive-result/headless-core-interactive-result';

export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The product.
   */
  product: Product;
}

export interface InteractiveResultProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: InteractiveResultOptions;
}

/**
 * The `InteractiveProduct` controller provides an interface for handling long presses, multiple clicks, etc. to ensure that Coveo usage analytics events are logged properly when a user selects a product.
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
    // TODO: Log on click
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
  };

  return buildInteractiveResultCore(engine, props, action);
}

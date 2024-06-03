import {Product} from '@coveo/relay-event-types';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {productClick} from '../../../../features/commerce/product/product-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions as InteractiveProductCoreOptions,
  InteractiveResultCoreProps as InteractiveResultHeadlessCoreProps,
} from '../../../core/interactive-result/headless-core-interactive-result';

export interface InteractiveProductOptions
  extends InteractiveProductCoreOptions {
  /**
   * The product to log analytics for.
   */
  product: Product;

  /**
   * The 1-based product's position across the non-paginated result set.
   */
  position: number;
}

export interface InteractiveProductCoreProps
  extends InteractiveResultHeadlessCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: InteractiveProductOptions;

  /**
   * The selector to fetch the response id from the state.
   */
  responseIdSelector: (state: CommerceEngineState) => string;
}

export type InteractiveProductProps = Omit<
  InteractiveProductCoreProps,
  'responseIdSelector'
>;

/**
 * The `InteractiveProduct` controller provides an interface for handling long presses, multiple clicks, etc. to ensure analytics events are logged properly when a user selects a product.
 */
export interface InteractiveProduct extends InteractiveResultCore {}

/**
 * Creates an `InteractiveProduct` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InteractiveProduct` properties.
 * @returns An `InteractiveProduct` controller instance.
 */
export function buildCoreInteractiveProduct(
  engine: CommerceEngine,
  props: InteractiveProductCoreProps
): InteractiveProduct {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(
      productClick({
        product: props.options.product,
        position: props.options.position,
        responseId: props.responseIdSelector(engine[stateKey]),
      })
    );
  };

  return buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened);
}

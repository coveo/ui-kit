import {Product} from '../../../../api/commerce/common/product';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productClick} from '../../../../features/commerce/context/product/product-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps as InteractiveResultHeadlessCoreProps,
} from '../../../core/interactive-result/headless-core-interactive-result';

export interface InteractiveResultOptions extends InteractiveResultCoreOptions {
  /**
   * The product.
   */
  // TODO: Which Product should this be? The headless one or the relay one? The product view controller uses the relay one.
  product: Product;
}

export interface InteractiveResultCoreProps
  extends InteractiveResultHeadlessCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: InteractiveResultOptions;

  /**
   * The selector to fetch the response id from the state.
   */
  responseIdSelector: () => string;
}

export type InteractiveResultProps = Omit<
  InteractiveResultCoreProps,
  'responseIdSelector'
>;

/**
 * The `InteractiveProduct` controller provides an interface for handling long presses, multiple clicks, etc. to ensure analytics events are logged properly when a user selects a product.
 */
export interface InteractiveResult extends InteractiveResultCore {}

/**
 * Creates an `InteractiveResult` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InteractiveResult` properties.
 * @returns An `InteractiveResult` controller instance.
 */
export function buildCoreInteractiveResult(
  engine: CommerceEngine,
  props: InteractiveResultCoreProps
): InteractiveResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(
      productClick({
        // TODO: If we used the relay Product, we would not need to construct the product here.
        product: {
          productId: props.options.product.permanentid,
          name: props.options.product.ec_name ?? '',
          price: props.options.product.ec_price ?? 0,
        },
        // TODO: The Product does not contain a position. Should we add it to the interface?
        position: 0,
        responseId: props.responseIdSelector(),
      })
    );
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
  };

  return buildInteractiveResultCore(engine, props, action);
}

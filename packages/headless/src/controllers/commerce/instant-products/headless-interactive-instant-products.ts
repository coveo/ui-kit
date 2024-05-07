import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
// import {pushRecentProduct} from '../../../features/commerce/recent-products/recent-products-actions';
import {
  InteractiveProduct,
  InteractiveProductCoreProps,
  InteractiveProductOptions,
  buildCoreInteractiveProduct,
} from '../core/result-list/headless-core-interactive-result';

export interface InteractiveInstantProductOptions
  extends InteractiveProductOptions {}

export interface InteractiveInstantProductProps
  extends InteractiveProductCoreProps {
  /**
   * The options for the `InteractiveInstantProduct` controller.
   * */
  options: InteractiveInstantProductOptions;
}

/**
 * The `InteractiveInstantProduct` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query product.
 */
export interface InteractiveInstantProduct extends InteractiveProduct {}

/**
 * Creates an `InteractiveInstantProduct` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveInstantProduct` properties.
 * @returns An `InteractiveInstantProduct` controller instance.
 */
export function buildInteractiveInstantProduct(
  engine: CommerceEngine,
  props: InteractiveInstantProductProps
): InteractiveInstantProduct {
  // TODO: find a way to dispatch this action
  // const action = () => {
  //   engine.dispatch(pushRecentProduct(props.options.product));
  // };

  return buildCoreInteractiveProduct(engine, props);
}

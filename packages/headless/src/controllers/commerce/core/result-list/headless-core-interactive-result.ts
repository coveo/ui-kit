import {Product} from '@coveo/relay-event-types';
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
   * The product to log analytics for.
   */
  product: Product;

  /**
   * The product's position across the entire non-paginated response, using a 1-based index.
   */
  position: number;
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
        product: props.options.product,
        position: props.options.position,
        responseId: props.responseIdSelector(),
      })
    );
  };

  return buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened);
}

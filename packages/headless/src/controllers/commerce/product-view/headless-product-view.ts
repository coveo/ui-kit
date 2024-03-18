import {Product} from '@coveo/relay-event-types';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {productView} from '../../../features/commerce/context/view/view-actions';

/**
 * The `ProductView` controller provides an interface for triggering an analytics event for a product view.
 */
export interface ProductView {
  /**
   * Trigger a view event for the product.
   * @param payload - The product view event payload.
   */
  view(product: Product): void;
}

/**
 * Creates an `ProductView` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductView` controller instance.
 */
export function buildProductView(engine: CommerceEngine): ProductView {
  return {
    view: (product) => {
      engine.dispatch(productView(product));
    },
  };
}

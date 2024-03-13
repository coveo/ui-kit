import {Ec} from '@coveo/relay-event-types';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';

/**
 * The `ProductView` controller provides an interface for triggering an analytics event for a product view.
 */
export interface ProductView {
  /**
   * Trigger a view event for the product.
   * @param payload - The product view event payload.
   */
  view(payload: Ec.ProductView): void;
}

/**
 * Creates an `ProductView` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductView` controller instance.
 */
export function buildProductView(engine: CommerceEngine): ProductView {
  return {
    view: (payload) => {
      engine.relay.emit('ec.productView', payload);
    },
  };
}

import type {Product} from '@coveo/relay-event-types';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import type {FrankensteinEngine} from '../../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureCommerceEngine} from '../../../app/frankenstein-engine/frankenstein-engine-utils.js';
import {productView} from '../../../features/commerce/product/product-actions.js';

/**
 * The `ProductView` controller provides an interface for triggering an analytics event for a product view.
 *
 * @group Buildable controllers
 * @category ProductView
 */
export interface ProductView {
  /**
   * Trigger a view event for the product.
   * @param product - The product view event payload.
   */
  view(product: Product): void;
}

/**
 * Creates an `ProductView` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductView` controller instance.
 *
 * @group Buildable controllers
 * @category ProductView
 */
export function buildProductView(
  engine: CommerceEngine | FrankensteinEngine
): ProductView {
  const commerceEngine = ensureCommerceEngine(engine);
  return {
    view: (product) => {
      commerceEngine.dispatch(productView(product));
    },
  };
}

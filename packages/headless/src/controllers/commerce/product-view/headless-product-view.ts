import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';

export interface ViewedProduct {
  // TODO: What goes here?
}

/**
 * The `ProductView` controller provides an interface for triggering an analytics event for a product view.
 */
export interface ProductView {
  /**
   * Trigger a view event for the product.
   * @param product
   */
  view(product: ViewedProduct): void;
}

/**
 * Creates an `ProductView` controller instance.
 *
 * eslint-disable-next-line @cspell/spellchecker
 * TODO LENS-1500: Make use of the engine
 * @param _engine - The headless commerce engine.
 * @returns A `ProductView` controller instance.
 */
export function buildProductView(
  // eslint-disable-next-line @cspell/spellchecker
  // TODO LENS-1500: Make use of the engine
  _engine: CommerceEngine
): ProductView {
  return {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO LENS-1500: Make use of the product
    view: (_product) => {
      // eslint-disable-next-line @cspell/spellchecker
      // TODO LENS-1500: Trigger product view
    },
  };
}

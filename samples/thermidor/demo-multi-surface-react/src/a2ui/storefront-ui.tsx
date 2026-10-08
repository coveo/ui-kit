import {createContext, useContext} from 'react';
import type {ProductCardProduct} from '../../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';

/**
 * What the shell's renderers can ask of the page. A completion opens the assistant page, which
 * is navigation, not an A2-UI action; adding a product, from the suggestions or from a product
 * card on the page, dispatches `updateCart` on the cart surface.
 */
export interface StorefrontUi {
  selectCompletion(expression: string): void;
  addToCart(product: ProductCardProduct): void;
}

const StorefrontUiContext = createContext<StorefrontUi | null>(null);

export const StorefrontUiProvider = StorefrontUiContext.Provider;

export function useStorefrontUi(): StorefrontUi {
  const value = useContext(StorefrontUiContext);
  if (!value) {
    throw new Error('useStorefrontUi must be used within a StorefrontUiProvider');
  }
  return value;
}

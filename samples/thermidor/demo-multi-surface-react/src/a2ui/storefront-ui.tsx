import {createContext, useContext} from 'react';
import type {ProductCardProduct} from '../../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';

/**
 * What the renderers can ask of the app. Neither is an A2-UI action: a completion opens a page,
 * and adding a product updates the app's cart.
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

import {createContext, useContext} from 'react';
import type {Product} from '@coveo/thermidor-schema';

/**
 * What the shell's renderers can ask of the page. A completion opens the assistant page, which
 * is navigation, not an A2-UI action; adding a product dispatches `updateCart` on the cart surface.
 */
export interface StorefrontUi {
  selectCompletion(expression: string): void;
  addToCart(product: Product): void;
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

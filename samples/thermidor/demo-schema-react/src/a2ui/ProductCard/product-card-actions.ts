import {createContext, type ReactNode} from 'react';

/** The product a card shows, as handed to its actions. */
export interface ProductCardProduct {
  productId: string;
  name: string;
  price: number | undefined;
}

/**
 * Renders extra actions at the bottom of every product card, such as an add-to-cart button. A
 * sample that has no use for them provides nothing, and the cards render none.
 */
export const ProductCardActionsContext = createContext<
  ((product: ProductCardProduct) => ReactNode) | null
>(null);

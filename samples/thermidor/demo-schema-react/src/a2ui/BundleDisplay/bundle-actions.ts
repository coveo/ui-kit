import {createContext, type ReactNode} from 'react';
import type {ProductCardProduct} from '../ProductCard/product-card-actions.js';

/** The active tier of a bundle, as handed to its actions. */
export interface BundleActionsBundle {
  /** The tier's label, such as `Budget`. */
  label: string;
  /** One product per slot of the tier, in slot order. */
  products: ProductCardProduct[];
}

/**
 * Renders extra actions in the footer of every bundle, such as an add-bundle-to-cart button. A
 * sample that has no use for them provides nothing, and bundles render none. The bundle calls it
 * once every slot of its active tier has resolved its product.
 */
export const BundleActionsContext = createContext<
  ((bundle: BundleActionsBundle) => ReactNode) | null
>(null);

/**
 * Lets the product a bundle slot mounts tell the bundle which product it shows, or `null` once it
 * shows none. Only bundles provide it.
 */
export const BundleSlotProductContext = createContext<
  ((product: ProductCardProduct | null) => void) | null
>(null);

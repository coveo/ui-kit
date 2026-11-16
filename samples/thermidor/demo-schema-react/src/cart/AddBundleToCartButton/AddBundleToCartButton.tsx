import type {ReactNode, SyntheticEvent} from 'react';
import type {BundleActionsBundle} from '../../a2ui/BundleDisplay/bundle-actions.js';
import {useCart} from '../CartProvider.js';
import type {CartProduct} from '../cart-store.js';
import styles from './AddBundleToCartButton.module.css';

export interface AddBundleToCartButtonProps {
  bundle: BundleActionsBundle;
}

function stopAndPrevent(event: SyntheticEvent) {
  event.stopPropagation();
  event.preventDefault();
}

/**
 * Adds one of each product of a bundle tier to the cart. Renders nothing when a product has no
 * price. While any of them has a cart request in flight it is `aria-disabled` (not `disabled`) to
 * keep focus.
 */
export function AddBundleToCartButton({bundle}: AddBundleToCartButtonProps) {
  const {pendingProductIds, add} = useCart();

  const cartProducts: CartProduct[] = [];
  for (const {price, ...product} of bundle.products) {
    if (price === undefined) {
      return null;
    }
    cartProducts.push({...product, unitPrice: price});
  }
  const pending = cartProducts.some((product) => pendingProductIds.has(product.productId));

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Add the ${bundle.label} bundle to cart`}
      aria-disabled={pending}
      onMouseDown={stopAndPrevent}
      onClick={(event) => {
        stopAndPrevent(event);
        if (pending) return;
        for (const product of cartProducts) {
          void add(product, 1);
        }
      }}
    >
      Add bundle to cart
    </button>
  );
}

/**
 * The actions of every bundle: an {@link AddBundleToCartButton} for its active tier. Provide it
 * through `BundleActionsContext`, inside a `CartProvider`.
 */
export const renderBundleCartActions = (bundle: BundleActionsBundle): ReactNode => (
  <AddBundleToCartButton bundle={bundle} />
);

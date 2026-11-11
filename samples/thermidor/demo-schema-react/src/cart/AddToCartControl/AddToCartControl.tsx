import {useContext, useEffect, useRef, type SyntheticEvent} from 'react';
import {CartStoreContext, useCart} from '../CartProvider.js';
import type {CartProduct} from '../cart-store.js';
import {QuantityStepper} from '../QuantityStepper/QuantityStepper.js';
import styles from './AddToCartControl.module.css';

export type AddToCartControlProduct = Omit<CartProduct, 'unitPrice'> & {
  unitPrice: number | undefined;
};

export interface AddToCartControlProps {
  product: AddToCartControlProduct;
  /** `compact` for dense rows such as instant-product options. */
  size?: 'default' | 'compact';
}

function stopAndPrevent(event: SyntheticEvent) {
  event.stopPropagation();
  event.preventDefault();
}

/**
 * Add to cart, then a − N + stepper. Swallows clicks, presses and Enter/Space so it can sit in
 * cards, links and popovers; keeps focus where it is on mouse press. Pending buttons are
 * `aria-disabled` (not `disabled`) to keep focus.
 */
export function AddToCartControl({product, size = 'default'}: AddToCartControlProps) {
  const {cart, pendingProductIds, add, remove} = useCart();
  const store = useContext(CartStoreContext);
  const controlRef = useRef<HTMLDivElement>(null);
  const swapButtonRef = useRef<HTMLButtonElement>(null);
  const focusFollowsSwapRef = useRef(false);

  const quantity = cart.items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const pending = pendingProductIds.has(product.productId);
  const inCart = quantity > 0;

  useEffect(() => {
    if (!focusFollowsSwapRef.current) return;
    focusFollowsSwapRef.current = false;
    const focused = document.activeElement;
    if (!focused || focused === document.body || controlRef.current?.contains(focused)) {
      swapButtonRef.current?.focus({preventScroll: true});
    }
  }, [inCart]);

  if (product.unitPrice === undefined) {
    return null;
  }
  const cartProduct: CartProduct = {...product, unitPrice: product.unitPrice};

  const send = (request: () => Promise<void>, swaps: boolean) => {
    if (pending) return;
    if (!swaps) {
      void request();
      return;
    }
    focusFollowsSwapRef.current = true;
    void request().then(() => {
      const stillInCart = store
        ?.getSnapshot()
        .cart.items.some((item) => item.productId === product.productId);
      if (stillInCart === inCart) {
        focusFollowsSwapRef.current = false;
      }
    });
  };
  const addOne = () => send(() => add(cartProduct, 1), !inCart);
  const removeOne = () => send(() => remove(product.productId, 1), quantity === 1);

  const className = `${styles.control} ${size === 'compact' ? styles.compact : ''}`;

  return (
    <div
      ref={controlRef}
      className={className}
      onClick={stopAndPrevent}
      onMouseDown={stopAndPrevent}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
      }}
    >
      {inCart ? (
        <QuantityStepper
          className={styles.stepper}
          productName={product.name}
          quantity={quantity}
          pending={pending}
          onDecrement={removeOne}
          onIncrement={addOne}
          size={size}
          incrementRef={swapButtonRef}
        />
      ) : (
        <button
          ref={swapButtonRef}
          type="button"
          className={styles.addButton}
          aria-label={`Add to cart, ${product.name}`}
          aria-disabled={pending}
          onClick={addOne}
        >
          Add to cart
        </button>
      )}
    </div>
  );
}

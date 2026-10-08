import {useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {CommerceCartItem} from '@coveo/thermidor';
import type {UpdateCartPayload} from '@coveo/thermidor-schema';
import {z} from 'zod';
import {formatPrice} from '../../../../demo-schema-react/src/utils.js';
import {useCart} from '../../session/storefront-session.js';
import styles from './Cart.module.css';

/**
 * The `Cart` props schema: the cart has no presentation fields. `@coveo/thermidor-schema` generates
 * it but does not export it yet.
 */
const CartPropsSchema = z.object({});

/**
 * A2-UI component for `Cart`. The cart's contents are client-owned and sent with every request in
 * `context.cart`; this surface is the anchor its `updateCart` actions are dispatched from.
 */
export const Cart = createReactComponent({name: 'Cart', schema: CartPropsSchema}, ({context}) => {
  const {items} = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const update = (item: CommerceCartItem, operation: UpdateCartPayload['operation']) => {
    const payload: UpdateCartPayload = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: operation === 'remove' ? item.quantity : 1,
      operation,
    };
    context.dispatchAction({event: {name: 'updateCart', context: payload}});
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Cart <span className={styles.count}>{count}</span>
      </button>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Cart">
          {items.length === 0 ? (
            <p className={styles.empty}>Your cart is empty.</p>
          ) : (
            <>
              <ul className={styles.items}>
                {items.map((item) => (
                  <li key={item.productId} className={styles.item}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.quantity}>
                      <button
                        type="button"
                        aria-label={`Add one more ${item.name}`}
                        onClick={() => update(item, 'add')}
                      >
                        +
                      </button>
                      {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => update(item, 'remove')}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.total}>Total {formatPrice(total)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
});

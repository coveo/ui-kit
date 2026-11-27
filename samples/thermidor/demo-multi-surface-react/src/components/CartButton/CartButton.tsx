import {useState} from 'react';
import type {CommerceCartItem} from '@coveo/converse';
import {formatPrice} from '../../../../demo-schema-react/src/utils.js';
import {getSampleConfiguration} from '../../env.js';
import {useCart} from '../../session/storefront-session.js';
import styles from './CartButton.module.css';

/**
 * The header's cart. The app draws it from its own cart, the one every request carries in
 * `context.cart`; no surface is involved.
 */
export function CartButton() {
  const {items, cart} = useCart();
  const {language, country, currency} = getSampleConfiguration();
  const format = (price: number) =>
    formatPrice(price, {locale: `${language}-${country}`, currency});
  const [open, setOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const update = (item: CommerceCartItem, operation: 'add' | 'remove') =>
    cart.apply({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: operation === 'remove' ? item.quantity : 1,
      operation,
    });

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
                    <span>{format(item.price * item.quantity)}</span>
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
              <p className={styles.total}>Total {format(total)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

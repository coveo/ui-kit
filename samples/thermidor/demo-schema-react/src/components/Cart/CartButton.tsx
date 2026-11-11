import {useEffect, useId, useRef, useState, type FocusEvent} from 'react';
import type {Cart} from '../../cart/cart-api.js';
import {useCart} from '../../cart/CartProvider.js';
import {EMPTY_CART} from '../../cart/cart-store.js';
import {CartPanel} from './CartPanel.js';
import styles from './CartButton.module.css';

interface PlacedOrder {
  id: string;
  /** The cart right after the purchase: the confirmation shows until it changes. */
  cart: Cart;
}

export function CartButton() {
  const {cart, purchase} = useCart();
  const [open, setOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const closeAndFocusButton = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const handleBlur = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (open && next instanceof Node && !containerRef.current?.contains(next)) {
      setOpen(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const result = await purchase();
      setOrder({id: result.transaction.id, cart: EMPTY_CART});
    } catch {
      // The store exposes the failure in `error`.
    } finally {
      setPurchasing(false);
    }
  };

  const count = cart.totalQuantity;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          closeAndFocusButton();
        }
      }}
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? closeAndFocusButton() : setOpen(true))}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path
            d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h8.4a1.5 1.5 0 0 0 1.5-1.1L21 7H6.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="19.5" r="1.5" fill="currentColor" />
          <circle cx="17" cy="19.5" r="1.5" fill="currentColor" />
        </svg>
        {count > 0 && (
          <span className={styles.badge} data-testid="cart-badge" aria-hidden="true">
            {count}
          </span>
        )}
      </button>
      {open && (
        <CartPanel
          id={panelId}
          purchasing={purchasing}
          orderId={order?.cart === cart ? order.id : null}
          onPurchase={() => void handlePurchase()}
        />
      )}
    </div>
  );
}

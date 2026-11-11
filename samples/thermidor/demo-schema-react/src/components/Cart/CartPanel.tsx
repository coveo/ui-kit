import {useEffect, useRef, useState} from 'react';
import type {CartLine} from '../../cart/cart-api.js';
import {useCart} from '../../cart/CartProvider.js';
import {QuantityStepper} from '../../cart/QuantityStepper/QuantityStepper.js';
import {formatPrice} from '../../utils.js';
import styles from './CartPanel.module.css';

const ERROR_DISPLAY_MS = 5000;

interface CartLineItemProps {
  line: CartLine;
  pending: boolean;
  onFocus(): void;
}

// `aria-disabled` rather than `disabled`, so a focused control keeps the focus while pending.
function CartLineItem({line, pending, onFocus}: CartLineItemProps) {
  const {add, remove} = useCart();
  const {productId, name, imageUrl, clickUri, unitPrice, quantity, lineTotal} = line;
  const unlessPending = (action: () => void) => () => {
    if (!pending) action();
  };

  return (
    <li className={styles.line} aria-busy={pending} onFocus={onFocus}>
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt="" loading="lazy" />
      ) : (
        <span className={styles.image} aria-hidden="true" />
      )}
      <div className={styles.details}>
        {clickUri ? (
          <a className={styles.name} href={clickUri} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        ) : (
          <span className={styles.name}>{name}</span>
        )}
        <span className={styles.unitPrice}>{formatPrice(unitPrice)} each</span>
        <div className={styles.controls}>
          <QuantityStepper
            productName={name}
            quantity={quantity}
            pending={pending}
            onDecrement={() => void remove(productId, 1)}
            onIncrement={() => void add({productId, name, imageUrl, clickUri, unitPrice}, 1)}
            decrementLabel={`Remove one ${name}`}
            incrementLabel={`Add one ${name}`}
          />
          <button
            type="button"
            className={styles.removeLine}
            aria-label={`Remove ${name} from the cart`}
            aria-disabled={pending}
            onClick={unlessPending(() => void remove(productId))}
          >
            Remove
          </button>
        </div>
      </div>
      <span className={styles.lineTotal}>{formatPrice(lineTotal)}</span>
    </li>
  );
}

/** Shows, for a few seconds, an error that occurs while the panel is open. */
function useTransientError(error: Error | null) {
  const [shown, setShown] = useState<Error | null>(null);
  const seen = useRef(error);

  useEffect(() => {
    if (error !== seen.current) {
      seen.current = error;
      setShown(error);
    }
  }, [error]);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(null), ERROR_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  return shown;
}

interface CartPanelProps {
  id: string;
  purchasing: boolean;
  orderId: string | null;
  onPurchase(): void;
}

export function CartPanel({id, purchasing, orderId, onPurchase}: CartPanelProps) {
  const {cart, status, pendingProductIds, error} = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linesRef = useRef<HTMLUListElement>(null);
  const focusedLine = useRef<{productId: string; index: number} | null>(null);
  const shownError = useTransientError(error);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const focused = focusedLine.current;
    if (!focused || cart.items.some((line) => line.productId === focused.productId)) return;
    focusedLine.current = null;
    if (panelRef.current?.contains(document.activeElement)) return;
    const lines = linesRef.current?.children ?? [];
    const next = lines[Math.min(focused.index, lines.length - 1)];
    (next?.querySelector<HTMLElement>('a, button') ?? headingRef.current)?.focus();
  }, [cart.items]);

  const isEmpty = cart.items.length === 0;
  const purchaseUnavailable =
    isEmpty || purchasing || pendingProductIds.size > 0 || status === 'loading';

  const body = () => {
    if (status === 'loading') {
      return (
        <p className={styles.message} role="status">
          Loading your cart…
        </p>
      );
    }
    if (orderId) {
      return (
        <div className={styles.confirmation} role="status">
          <p className={styles.confirmationTitle}>Order placed</p>
          <p className={styles.message}>Order number {orderId}</p>
        </div>
      );
    }
    if (isEmpty) {
      return <p className={styles.message}>Your cart is empty</p>;
    }
    return (
      <ul ref={linesRef} className={styles.lines}>
        {cart.items.map((line, index) => (
          <CartLineItem
            key={line.productId}
            line={line}
            pending={pendingProductIds.has(line.productId)}
            onFocus={() => {
              focusedLine.current = {productId: line.productId, index};
            }}
          />
        ))}
      </ul>
    );
  };

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      role="dialog"
      aria-label="Cart"
      tabIndex={-1}
    >
      <h2 ref={headingRef} className={styles.heading} tabIndex={-1}>
        Your cart
      </h2>
      <div className={styles.body}>{body()}</div>
      {shownError && (
        <p className={styles.error} role="alert">
          Something went wrong with your cart. Please try again.
        </p>
      )}
      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <dt>Total</dt>
          <dd>{formatPrice(cart.total)}</dd>
        </div>
      </dl>
      <button
        type="button"
        className={styles.purchase}
        aria-disabled={purchaseUnavailable}
        onClick={() => {
          if (!purchaseUnavailable) onPurchase();
        }}
      >
        {purchasing ? 'Placing order…' : 'Purchase'}
      </button>
    </div>
  );
}

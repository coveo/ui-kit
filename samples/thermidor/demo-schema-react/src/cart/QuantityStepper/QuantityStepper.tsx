import type {Ref} from 'react';
import styles from './QuantityStepper.module.css';

export interface QuantityStepperProps {
  productName: string;
  quantity: number;
  /** Makes both buttons `aria-disabled` (not `disabled`, to keep focus) and ignores their clicks. */
  pending: boolean;
  onDecrement(): void;
  onIncrement(): void;
  /** `compact` for dense rows such as instant-product options. */
  size?: 'default' | 'compact';
  /** Defaults to `Remove one <productName> from cart`. */
  decrementLabel?: string;
  /** Defaults to `Add one more <productName> to cart`. */
  incrementLabel?: string;
  incrementRef?: Ref<HTMLButtonElement>;
  className?: string;
}

/** A − N + stepper for the quantity of a product in the cart. */
export function QuantityStepper({
  productName,
  quantity,
  pending,
  onDecrement,
  onIncrement,
  size = 'default',
  decrementLabel = `Remove one ${productName} from cart`,
  incrementLabel = `Add one more ${productName} to cart`,
  incrementRef,
  className,
}: QuantityStepperProps) {
  const unlessPending = (action: () => void) => () => {
    if (!pending) action();
  };
  const classNames = [styles.stepper, size === 'compact' && styles.compact, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="group" aria-label={`Quantity of ${productName}`}>
      <button
        type="button"
        aria-label={decrementLabel}
        aria-disabled={pending}
        onClick={unlessPending(onDecrement)}
      >
        −
      </button>
      <span className={styles.quantity} aria-live="polite">
        {quantity}
        <span className={styles.visuallyHidden}> in cart</span>
      </span>
      <button
        ref={incrementRef}
        type="button"
        aria-label={incrementLabel}
        aria-disabled={pending}
        onClick={unlessPending(onIncrement)}
      >
        +
      </button>
    </div>
  );
}

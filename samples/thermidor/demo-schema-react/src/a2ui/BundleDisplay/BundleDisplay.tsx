import {Fragment, useCallback, useState, useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';

import {useRemoteController} from '../controllers.js';
import {useSession} from '../../context/session.js';
import type {BundleDisplayProps, BundleSlot, BundleTier, Product} from '@coveo/thermidor-schema';
import styles from './BundleDisplay.module.css';

/**
 * The bundle-display renderer mounts each slot's product-summary child through the
 * `children(id)` mount function, using the `childId` carried by each slot in its own
 * AG-UI state (`state.tiers[].slots[].childId`). Unlike the other container renderers, it
 * does not read the node's flat `children` list off `props`: the tier/slot structure it
 * needs — grouping, ordering, and the slot→child association — lives in `state`, so it
 * iterates the slots directly rather than a flat id list.
 */
function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

function productUnitPrice(product: Product | null | undefined): number {
  if (!product) {
    return 0;
  }
  return product.ec_promo_price ?? product.ec_price ?? 0;
}

/**
 * Sums the unit price of each slot's product-summary child by reading that
 * child's server-owned state from the session. Each child's state is obtained
 * through a vended `product-summary` remote controller keyed by the slot's
 * `childId`; the sum is recomputed whenever the session's active turn state
 * changes.
 */
function usePackageTotal(slots: BundleSlot[]): number {
  const session = useSession();

  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session]
  );

  const childKey = slots.map((slot) => slot.childId).join('|');

  const getSnapshot = useCallback(() => {
    return slots.reduce((sum, slot) => {
      const childState = session.remoteController(slot.childId, 'product-summary').state;
      return sum + productUnitPrice(childState?.product);
    }, 0);
    // `childKey` captures the slot identity set so the snapshot recomputes when
    // the active tier's slots change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, childKey]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function BundleDisplayRenderer({
  props,
  children,
}: {
  props: BundleDisplayProps;
  children: (id: string) => ReactNode;
}) {
  const controller = useRemoteController(props.componentId, props.componentType);
  const tiers = controller.state?.tiers ?? [];
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const activeTier = tiers[activeTierIndex] ?? tiers[0];
  const activeSlots = activeTier?.slots ?? [];

  const packageTotal = usePackageTotal(activeSlots);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Beginner Surfing Kit</h3>
      </div>
      {tiers.length > 0 && (
        <div className={styles.tabs}>
          {tiers.map((tier: BundleTier, i: number) => (
            <button
              key={tier.label}
              className={`${styles.tab} ${i === activeTierIndex ? styles.tabActive : ''}`}
              onClick={() => setActiveTierIndex(i)}
              type="button"
            >
              {tier.label}
            </button>
          ))}
        </div>
      )}
      {activeTier && (
        <div className={styles.tierContent}>
          {activeTier.description && <p className={styles.description}>{activeTier.description}</p>}
          <div className={styles.itemList} role="list" aria-label="Bundle items">
            {activeSlots.map((slot: BundleSlot) => (
              <Fragment key={slot.childId}>{children(slot.childId)}</Fragment>
            ))}
          </div>
          {activeSlots.length > 0 && (
            <div className={styles.footer}>
              <div className={styles.footerLabel}>
                <span className={styles.footerTitle}>Package Total</span>
                <span className={styles.footerCount}>
                  {activeSlots.length} {activeSlots.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className={styles.footerPrice}>{formatPrice(packageTotal)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

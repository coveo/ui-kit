import {Fragment, useState} from 'react';

import type {BundleDisplayProps, BundleSlot, BundleTier} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './BundleDisplay.module.css';

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * A2-UI renderer for the `bundle-display` container.
 *
 * Reads its tier structure directly from its resolved props (bound to the A2-UI data model)
 * and, for the ACTIVE tier only, mounts each slot's product-summary child through the
 * `children(id)` mount function keyed by the slot's `childId`. Unlike the ordered-list
 * containers, the tier/slot grouping is itself business state, so the renderer iterates the
 * active tier's slots rather than a flat `children` list.
 *
 * Each mounted product-summary child owns its own state (its price included) resolved from
 * the data model, so the bundle renderer does not aggregate sibling state or read any
 * cross-component join. The per-tier package total is a backend-computed value carried on
 * the tier itself (`tier.total`), rendered as-is rather than summed from the children.
 */
export function BundleDisplayRenderer({
  props,
  children,
}: TypedRendererProps<BundleDisplayProps, never>) {
  const tiers = props.tiers ?? [];
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const activeTier = tiers[activeTierIndex] ?? tiers[0];
  const activeSlots = activeTier?.slots ?? [];

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
              <span className={styles.footerPrice}>{formatPrice(activeTier.total)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

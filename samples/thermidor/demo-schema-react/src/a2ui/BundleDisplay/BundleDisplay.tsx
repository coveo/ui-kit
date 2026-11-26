import {useState} from 'react';

import {createComponentImplementation} from '@a2ui/react/v0_9';
import type {BundleSlot, BundleTier} from '@coveo/thermidor-schema';
import {BundleDisplayPropsSchema} from '@coveo/thermidor-schema/zod3';
import {formatConfiguredPrice as formatPrice} from '../../context/format-configured-price.js';
import {DataChild} from '../data-child.js';
import styles from './BundleDisplay.module.css';

/**
 * A2-UI component for the `bundle-display` container.
 *
 * The generic binder resolves `heading` and `tiers` from `BundleDisplayPropsSchema`; the heading is
 * left out when the backend sends none. For the active tier only it mounts each slot's
 * product-summary child with `DataChild`: the slot ids arrive in the bound `tiers`, which
 * `buildChild` cannot draw from. Each child owns its own resolved state
 * (price included); the per-tier total is the backend-computed `tier.total`, rendered as-is.
 */
export const BundleDisplay = createComponentImplementation(
  {
    name: 'BundleDisplay',
    schema: BundleDisplayPropsSchema,
  },
  ({props}) => {
    const heading = props.heading;
    const tiers = props.tiers ?? [];
    const [activeTierIndex, setActiveTierIndex] = useState(0);

    const activeTier = tiers[activeTierIndex] ?? tiers[0];
    const activeSlots = activeTier?.slots ?? [];

    return (
      <section className={styles.container}>
        {heading && (
          <div className={styles.header}>
            <h3 className={styles.title}>{heading}</h3>
          </div>
        )}
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
            {activeTier.description && (
              <p className={styles.description}>{activeTier.description}</p>
            )}
            <div className={styles.itemList} role="list" aria-label="Bundle items">
              {activeSlots.map((slot: BundleSlot) => (
                <DataChild key={slot.childId} id={slot.childId} />
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
);

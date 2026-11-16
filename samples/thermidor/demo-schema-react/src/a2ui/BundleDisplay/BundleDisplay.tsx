import {useCallback, useContext, useMemo, useState, type ReactNode} from 'react';

import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {BundleSlot, BundleTier} from '@coveo/thermidor-schema';
import {BundleDisplayPropsSchema} from '@coveo/thermidor-schema/zod3';
import type {ProductCardProduct} from '../ProductCard/product-card-actions.js';
import {BundleActionsContext, BundleSlotProductContext} from './bundle-actions.js';
import styles from './BundleDisplay.module.css';

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

type ReportSlotProduct = (childId: string, product: ProductCardProduct | null) => void;

function BundleSlotChild({
  childId,
  report,
  children,
}: {
  childId: string;
  report: ReportSlotProduct;
  children: ReactNode;
}) {
  const reportProduct = useCallback(
    (product: ProductCardProduct | null) => report(childId, product),
    [report, childId]
  );
  return (
    <BundleSlotProductContext.Provider value={reportProduct}>
      {children}
    </BundleSlotProductContext.Provider>
  );
}

/**
 * A2-UI component for the `bundle-display` container.
 *
 * The generic binder resolves `heading` and `tiers` from `BundleDisplayPropsSchema`; the heading is
 * left out when the backend sends none. For the active tier only it mounts each slot's
 * product-summary child via `buildChild(slot.childId)`. Each child owns its own resolved state
 * (price included) and reports its product through `BundleSlotProductContext`; the per-tier total
 * is the backend-computed `tier.total`, rendered as-is. Once every active slot has reported a
 * product, the footer renders the `BundleActionsContext` actions for the tier.
 */
export const BundleDisplay = createReactComponent(
  {
    name: 'BundleDisplay',
    schema: BundleDisplayPropsSchema,
  },
  ({props, buildChild}) => {
    const heading = props.heading;
    const tiers = props.tiers ?? [];
    const [activeTierIndex, setActiveTierIndex] = useState(0);
    const [slotProducts, setSlotProducts] = useState<ReadonlyMap<string, ProductCardProduct>>(
      () => new Map()
    );
    const renderActions = useContext(BundleActionsContext);

    const reportSlotProduct = useCallback<ReportSlotProduct>((childId, product) => {
      setSlotProducts((previous) => {
        const next = new Map(previous);
        if (product) {
          next.set(childId, product);
        } else {
          next.delete(childId);
        }
        return next;
      });
    }, []);

    const activeTier = tiers[activeTierIndex] ?? tiers[0];
    const activeSlots: BundleSlot[] = activeTier?.slots ?? [];

    const activeProducts = useMemo(() => {
      const products = activeSlots.map((slot) => slotProducts.get(slot.childId));
      return products.every((product) => product !== undefined)
        ? (products as ProductCardProduct[])
        : null;
    }, [activeSlots, slotProducts]);

    const actions =
      renderActions && activeTier && activeProducts && activeProducts.length > 0
        ? renderActions({label: activeTier.label, products: activeProducts})
        : null;

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
                <BundleSlotChild
                  key={slot.childId}
                  childId={slot.childId}
                  report={reportSlotProduct}
                >
                  {buildChild(slot.childId)}
                </BundleSlotChild>
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
                <div className={styles.footerEnd}>
                  <span className={styles.footerPrice}>{formatPrice(activeTier.total)}</span>
                  {actions != null && <div className={styles.footerActions}>{actions}</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
);

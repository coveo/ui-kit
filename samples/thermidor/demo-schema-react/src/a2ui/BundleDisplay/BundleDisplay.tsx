import {useState} from 'react';
import {selectRemoteControllerState} from '@coveo/thermidor';

import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {
  BundleDisplayProps,
  Product,
  ProductListState,
  BundleTier,
} from '@coveo/thermidor-schema';
import styles from './BundleDisplay.module.css';

export function BundleDisplayRenderer({props}: {props: BundleDisplayProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const tiers = controller.state?.tiers ?? [];
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  if (tiers.length === 0) {
    return null;
  }

  const activeTier = tiers[activeTierIndex] ?? tiers[0];

  const resolvedItems: Array<{categoryLabel: string; product: Product | null}> = [];
  if (activeTier) {
    for (const slot of activeTier.slots) {
      const controllerState = selectRemoteControllerState(stateSource.state, slot.surfaceRef);
      const products = (controllerState as ProductListState | undefined)?.products;
      resolvedItems.push({categoryLabel: slot.categoryLabel, product: products?.[0] ?? null});
    }
  }

  const totalPrice = resolvedItems.reduce((sum, item) => {
    const price = item.product?.ec_promo_price ?? item.product?.ec_price ?? 0;
    return sum + price;
  }, 0);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Beginner Surfing Kit</h3>
      </div>
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
      {activeTier && (
        <div className={styles.tierContent}>
          <p className={styles.description}>{activeTier.description}</p>
          <div className={styles.itemList}>
            {resolvedItems.map((item) => (
              <div key={item.categoryLabel} className={styles.itemRow}>
                {item.product?.ec_images?.[0] && (
                  <img
                    className={styles.itemImage}
                    src={item.product.ec_images[0]}
                    alt={item.product.ec_name ?? item.categoryLabel}
                    loading="lazy"
                  />
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>
                    {item.product?.ec_name ?? item.categoryLabel}
                  </span>
                  {item.product?.ec_shortdesc && (
                    <span className={styles.itemDescription}>{item.product.ec_shortdesc}</span>
                  )}
                  {item.product?.ec_promo_price !== undefined && (
                    <span className={styles.itemPrice}>
                      ${item.product.ec_promo_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {resolvedItems.length > 0 && totalPrice > 0 && (
            <div className={styles.footer}>
              <div className={styles.footerLabel}>
                <span className={styles.footerTitle}>Package Total</span>
                <span className={styles.footerCount}>
                  {resolvedItems.length} {resolvedItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className={styles.footerPrice}>${totalPrice.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

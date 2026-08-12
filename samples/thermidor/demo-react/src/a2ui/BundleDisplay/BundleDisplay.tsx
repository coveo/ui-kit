import {useState} from 'react';
import {useTargeting} from '../../context/targeting.js';
import {formatPrice} from '../../utils.js';
import styles from './BundleDisplay.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIBundleDisplayProps {
  surface: ParsedSurface;
  allSurfaces: ParsedSurface[];
}

interface BundleSlot {
  categoryLabel: string;
  surfaceRef: string;
}

interface BundleTier {
  bundleId: string;
  label: string;
  description: string;
  slots: BundleSlot[];
}

interface BundleItem {
  ec_name?: string;
  ec_description?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
}

interface BundleDisplayData {
  title?: {
    value?: string;
  };
  bundles?: BundleTier[];
}

export function A2UIBundleDisplay({surface, allSurfaces}: A2UIBundleDisplayProps) {
  const data = surface.data as BundleDisplayData;
  const title = data.title?.value ?? 'Bundle';
  const bundles = data.bundles ?? [];
  const [activeTier, setActiveTier] = useState(bundles[0]?.bundleId ?? '');
  const targeting = useTargeting();
  const isTargetable = targeting?.isTargeting ?? false;

  if (bundles.length === 0) {
    return null;
  }

  const activeBundle = bundles.find((b) => b.bundleId === activeTier);

  const resolvedItems: BundleItem[] = [];
  if (activeBundle) {
    for (const slot of activeBundle.slots) {
      const refSurface = allSurfaces.find((s) => s.surfaceId === slot.surfaceRef);
      if (refSurface) {
        resolvedItems.push(refSurface.data as unknown as BundleItem);
      }
    }
  }

  const totalPrice = resolvedItems.reduce((sum, item) => sum + (item.ec_price ?? 0), 0);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.tabs}>
        {bundles.map((bundle) => (
          <button
            key={bundle.bundleId}
            className={`${styles.tab} ${bundle.bundleId === activeTier ? styles.tabActive : ''}`}
            onClick={() => setActiveTier(bundle.bundleId)}
            type="button"
          >
            {bundle.label}
          </button>
        ))}
      </div>
      {activeBundle && (
        <div className={styles.tierContent}>
          <p className={styles.description}>{activeBundle.description}</p>
          <div className={styles.itemList}>
            {resolvedItems.map((item, i) => {
              const productId = item.ec_product_id ?? '';
              const isSelected = targeting?.selectedProductIds.has(productId) ?? false;

              const rowClasses = [
                styles.itemRow,
                isTargetable ? styles.targetable : '',
                isSelected ? styles.selected : '',
              ]
                .filter(Boolean)
                .join(' ');

              const interactiveProps = isTargetable
                ? {
                    role: 'button' as const,
                    tabIndex: 0,
                    onClick: () =>
                      targeting!.onProductTargeted(productId, item.ec_name ?? '', item.ec_image),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        targeting!.onProductTargeted(productId, item.ec_name ?? '', item.ec_image);
                      }
                    },
                  }
                : {};

              return (
                <div key={item.ec_product_id ?? i} className={rowClasses} {...interactiveProps}>
                  {item.ec_image && (
                    <img
                      className={styles.itemImage}
                      src={item.ec_image}
                      alt={item.ec_name ?? 'Product'}
                      loading="lazy"
                    />
                  )}
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.ec_name}</span>
                    {item.ec_description && (
                      <span className={styles.itemDescription}>{item.ec_description}</span>
                    )}
                    {item.ec_price !== undefined && (
                      <span className={styles.itemPrice}>{formatPrice(item.ec_price)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {resolvedItems.length > 0 && (
            <div className={styles.footer}>
              <div className={styles.footerLabel}>
                <span className={styles.footerTitle}>Package Total</span>
                <span className={styles.footerCount}>
                  {resolvedItems.length} {resolvedItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className={styles.footerPrice}>{formatPrice(totalPrice)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

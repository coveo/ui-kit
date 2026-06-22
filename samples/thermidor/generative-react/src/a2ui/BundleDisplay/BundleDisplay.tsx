import {useState} from 'react';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
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

export function A2UIBundleDisplay({
  surface,
  allSurfaces,
}: A2UIBundleDisplayProps) {
  const title =
    (surface.componentProps.title as {literalString?: string})?.literalString ??
    'Bundle';

  const bundles = (surface.componentProps.bundles as BundleTier[]) ?? [];
  const [activeTier, setActiveTier] = useState(bundles[0]?.bundleId ?? '');

  if (bundles.length === 0) {
    return null;
  }

  const activeBundle = bundles.find((b) => b.bundleId === activeTier);

  return (
    <section className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
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
          <div className={styles.slots}>
            {activeBundle.slots.map((slot) => {
              const refSurface = allSurfaces.find(
                (s) => s.surfaceId === slot.surfaceRef
              );
              const items =
                (refSurface?.data.items as Record<string, unknown>[]) ?? [];
              const item = items[0];
              return (
                <div key={slot.surfaceRef} className={styles.slot}>
                  <span className={styles.slotLabel}>{slot.categoryLabel}</span>
                  {item ? (
                    <A2UIProductCard
                      ec_name={item.ec_name as string}
                      ec_brand={item.ec_brand as string}
                      ec_price={item.ec_price as number}
                      ec_image={item.ec_image as string}
                      ec_product_id={item.ec_product_id as string}
                      clickUri={item.clickUri as string}
                    />
                  ) : (
                    <div className={styles.emptySlot}>Loading…</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

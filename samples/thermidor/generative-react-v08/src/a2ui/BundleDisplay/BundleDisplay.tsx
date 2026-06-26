import {useState} from 'react';
import styles from './BundleDisplay.module.css';

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

interface A2UIBundleDisplayProps {
  title: string;
  bundles: BundleTier[];
  renderSlot: (slot: BundleSlot) => React.ReactNode;
}

export function A2UIBundleDisplay({
  title,
  bundles,
  renderSlot,
}: A2UIBundleDisplayProps) {
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
            {activeBundle.slots.map((slot) => (
              <div key={slot.surfaceRef} className={styles.slot}>
                <span className={styles.slotLabel}>{slot.categoryLabel}</span>
                {renderSlot(slot)}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

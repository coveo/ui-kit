import {useState} from 'react';
import type {BundleTierConfig, Product} from '../../types/commerce.js';
import {PriceDisplay} from './PriceDisplay.js';
import './BundleDisplay.css';

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

interface BundleTierWithProducts extends Omit<BundleTierConfig, 'slots'> {
  slots: BundleSlotWithProduct[];
}

interface BundleDisplayProps {
  title: string;
  bundles: BundleTierWithProducts[];
  isLoading?: boolean;
}

function BundleSlotCard({slot}: {slot: BundleSlotWithProduct}) {
  return (
    <div className="bundle-slot">
      <p className="bundle-slot__label">{slot.categoryLabel}</p>
      {slot.product ? (
        <>
          <img
            src={slot.product.ec_image}
            alt={slot.product.ec_name}
            className="bundle-slot__image"
          />
          <p className="bundle-slot__name">{slot.product.ec_name}</p>
          <p className="bundle-slot__brand">{slot.product.ec_brand}</p>
          <PriceDisplay product={slot.product} />
        </>
      ) : (
        <p className="text-muted">Product not available</p>
      )}
    </div>
  );
}

export function BundleDisplay({
  title,
  bundles,
  isLoading = false,
}: BundleDisplayProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (bundles.length === 0 && !isLoading) return null;

  if (bundles.length === 0 && isLoading) {
    return (
      <div className="bundle-display" aria-busy="true">
        <h3 className="commerce-heading">{title}</h3>
        <div className="bundle-slots">
          {Array.from({length: 3}, (_, i) => (
            <div
              key={`bundle-skeleton-${i}`}
              className="bundle-slot"
              aria-hidden="true"
            >
              <div className="commerce-loading commerce-loading--line" />
              <div className="commerce-loading commerce-loading--image" />
              <div className="commerce-loading commerce-loading--line commerce-loading--line-wide" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeBundle = bundles[activeIndex];

  return (
    <div className="bundle-display">
      <h3 className="commerce-heading">{title}</h3>
      {bundles.length > 1 && (
        <div className="bundle-tabs" role="tablist" aria-label="Bundle tiers">
          {bundles.map((bundle, i) => (
            <button
              key={bundle.bundleId}
              role="tab"
              aria-selected={i === activeIndex}
              className={`bundle-tab${i === activeIndex ? ' bundle-tab--active' : ''}`}
              onClick={() => setActiveIndex(i)}
              type="button"
            >
              {bundle.label}
            </button>
          ))}
        </div>
      )}
      {activeBundle && (
        <div role="tabpanel">
          {activeBundle.description && (
            <p className="bundle-description">{activeBundle.description}</p>
          )}
          <div className="bundle-slots">
            {activeBundle.slots.map((slot, i) => (
              <BundleSlotCard key={`${slot.surfaceRef}-${i}`} slot={slot} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

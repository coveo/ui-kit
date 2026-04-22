import {useEffect, useId, useState} from 'react';
import {formatPrice, hasDiscount, promoPrice} from '../lib/commerceHelpers.js';
import type {BundleTierConfig, Product} from '../types/commerce.js';

import './BundleDisplay.css';

export interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

export interface BundleTierWithProducts extends Omit<
  BundleTierConfig,
  'slots'
> {
  slots: BundleSlotWithProduct[];
}

interface BundleDisplayProps {
  heading: string;
  bundles: BundleTierWithProducts[];
  isLoading: boolean;
}

function PriceDisplay({product}: {product: Product}): React.JSX.Element {
  const hasPromoDiscount = hasDiscount(product);
  const regularPrice = formatPrice(product.ec_price);
  const promotionalPrice = formatPrice(promoPrice(product));

  if (!hasPromoDiscount) {
    return (
      <span className="rh-bundle-price">
        <span className="rh-bundle-price-regular">{regularPrice}</span>
      </span>
    );
  }

  return (
    <span className="rh-bundle-price">
      <span className="rh-bundle-price-original">{regularPrice}</span>
      <span className="rh-bundle-price-promo">{promotionalPrice}</span>
    </span>
  );
}

function Slot({slot}: {slot: BundleSlotWithProduct}): React.JSX.Element {
  const product = slot.product;

  return (
    <article className="rh-bundle-slot">
      <p className="rh-bundle-slot__label">{slot.categoryLabel}</p>
      {product ? (
        <>
          {product.ec_image ? (
            <img
              src={product.ec_image}
              alt={product.ec_name}
              className="rh-bundle-slot__image"
            />
          ) : (
            <div
              className="rh-bundle-slot__image--placeholder"
              aria-hidden="true"
            />
          )}
          <p className="rh-bundle-slot__name">{product.ec_name}</p>
          <p className="rh-bundle-slot__brand">{product.ec_brand}</p>
          <PriceDisplay product={product} />
        </>
      ) : (
        <p className="rh-bundle-text-muted">Product not available</p>
      )}
    </article>
  );
}

function LoadingState({heading}: {heading: string}): React.JSX.Element {
  return (
    <div className="rh-bundle-display" aria-busy="true">
      <h3 className="commerce-heading">{heading}</h3>
      <div className="rh-bundle-slots">
        {Array.from({length: 3}, (_, index) => (
          <div key={index} className="rh-bundle-slot" aria-hidden="true">
            <div className="rh-bundle-loading rh-bundle-loading--line" />
            <div className="rh-bundle-loading rh-bundle-loading--image" />
            <div className="rh-bundle-loading rh-bundle-loading--line rh-bundle-loading--line-wide" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BundleDisplay({
  heading,
  bundles,
  isLoading,
}: BundleDisplayProps): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const idPrefix = useId();

  useEffect(() => {
    if (bundles.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, bundles.length - 1));
  }, [bundles]);

  if (bundles.length === 0 && !isLoading) {
    return null;
  }

  if (bundles.length === 0 && isLoading) {
    return <LoadingState heading={heading} />;
  }

  const activeBundle = bundles[activeIndex];

  if (!activeBundle) {
    return null;
  }

  const getTabId = (index: number) => `${idPrefix}-bundle-tab-${index}`;
  const getPanelId = (index: number) => `${idPrefix}-bundle-panel-${index}`;

  const onTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (bundles.length < 2) {
      return;
    }

    const lastIndex = bundles.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
  };

  return (
    <div className="rh-bundle-display">
      <h3 className="commerce-heading">{heading}</h3>
      {bundles.length > 1 ? (
        <div
          className="rh-bundle-tabs"
          role="tablist"
          aria-label="Bundle tiers"
        >
          {bundles.map((bundle, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${bundle.label}-${index}`}
                id={getTabId(index)}
                type="button"
                role="tab"
                className={`rh-bundle-tab${isActive ? ' rh-bundle-tab--active' : ''}`}
                aria-selected={isActive ? 'true' : 'false'}
                aria-controls={getPanelId(index)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                {bundle.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        id={getPanelId(activeIndex)}
        role="tabpanel"
        aria-labelledby={getTabId(activeIndex)}
      >
        {activeBundle.description ? (
          <p className="rh-bundle-description">{activeBundle.description}</p>
        ) : null}
        <div className="rh-bundle-slots">
          {activeBundle.slots.map((slot, index) => (
            <Slot key={`${slot.surfaceRef}-${index}`} slot={slot} />
          ))}
        </div>
      </div>
    </div>
  );
}

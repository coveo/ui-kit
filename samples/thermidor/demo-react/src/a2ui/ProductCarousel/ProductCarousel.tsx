import {useState, useRef, useEffect, useCallback} from 'react';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import styles from './ProductCarousel.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIProductCarouselProps {
  surface: ParsedSurface;
}

interface ProductItem {
  ec_name?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
}

export function A2UIProductCarousel({surface}: A2UIProductCarouselProps) {
  const heading = extractHeading(surface);
  const items = extractProducts(surface);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 0);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener('scroll', updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, items.length]);

  if (items.length === 0) {
    return null;
  }

  const scrollBy = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = track.clientWidth * 0.8;
    track.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.container}>
      <h3 className={styles.heading}>{heading}</h3>
      <div className={styles.trackWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={() => scrollBy('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}
        <div
          className={styles.track}
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label={heading}
        >
          {items.map((item, i) => (
            <div className={styles.cardSlot} key={item.ec_product_id ?? i}>
              <A2UIProductCard
                ec_name={item.ec_name}
                ec_brand={item.ec_brand}
                ec_price={item.ec_price}
                ec_image={item.ec_image}
                ec_product_id={item.ec_product_id}
                clickUri={item.clickUri}
              />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={() => scrollBy('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * Extract heading from surface data.
 * Unified endpoint format: dataModel.heading.value
 * Legacy format: componentProps.heading.literalString
 */
function extractHeading(surface: ParsedSurface): string {
  const dataHeading = surface.data.heading as {value?: string} | undefined;
  if (dataHeading?.value) {
    return dataHeading.value;
  }
  const propsHeading = surface.componentProps.heading as {literalString?: string} | undefined;
  if (propsHeading?.literalString) {
    return propsHeading.literalString;
  }
  return 'Products';
}

/**
 * Extract product items from surface data.
 * Unified endpoint format: dataModel.products.items
 * Legacy format: data.items (flat array)
 */
function extractProducts(surface: ParsedSurface): ProductItem[] {
  const products = surface.data.products as {items?: ProductItem[]} | undefined;
  if (products?.items) {
    return products.items;
  }
  if (Array.isArray(surface.data.items)) {
    return surface.data.items as ProductItem[];
  }
  return [];
}

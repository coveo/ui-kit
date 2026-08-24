import {useState, useRef, useEffect, useCallback} from 'react';

import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {Product, ProductCarouselProps} from '@coveo/thermidor-schema';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import styles from './ProductCarousel.module.css';

export function ProductCarouselRenderer({
  props,
}: {
  props: ProductCarouselProps & {heading?: string};
}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const products = controller.state?.products ?? [];
  const heading = props.heading ?? 'Featured products';
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
  }, [updateScrollState, products.length]);

  if (products.length === 0) {
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
          {products.map((product: Product) => (
            <div className={styles.cardSlot} key={product.permanentid}>
              <A2UIProductCard
                ec_name={product.ec_name}
                ec_brand={product.ec_brand}
                ec_price={product.ec_promo_price ?? product.ec_price}
                ec_image={product.ec_images?.[0]}
                ec_product_id={product.permanentid}
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

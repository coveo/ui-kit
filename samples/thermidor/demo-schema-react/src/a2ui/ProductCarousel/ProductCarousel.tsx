import {useState, useRef, useEffect, useCallback} from 'react';

import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {Product} from '@coveo/thermidor-schema';
import {ProductCarouselPropsSchema} from '@coveo/thermidor-schema/zod3';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {ProductVariants} from '../ProductVariants/ProductVariants.js';
import {usePromotedProduct} from '../ProductVariants/use-promoted-product.js';
import styles from './ProductCarousel.module.css';

/**
 * A2-UI component for the `product-carousel`. The generic binder resolves `products` / `heading`
 * from `ProductCarouselPropsSchema`; a horizontally scrollable track of product cards, with
 * scroll-affordance nav buttons driven by local scroll state. The app may add actions to each card
 * through `ProductCardActionsContext`.
 */
export const ProductCarousel = createReactComponent(
  {
    name: 'ProductCarousel',
    schema: ProductCarouselPropsSchema,
  },
  ({props}) => {
    const products = props.products ?? [];
    const heading = props.heading ?? '';
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
        {heading && <h3 className={styles.heading}>{heading}</h3>}
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
            aria-label={heading || 'Products'}
          >
            {products.map((product: Product) => (
              <div className={styles.cardSlot} key={product.permanentid}>
                <CarouselProductCard product={product} />
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
);

function CarouselProductCard({product}: {product: Product}) {
  const [shown, promote] = usePromotedProduct(product);
  return (
    <A2UIProductCard
      ec_name={shown.ec_name}
      ec_brand={shown.ec_brand}
      ec_price={shown.ec_promo_price ?? shown.ec_price}
      ec_image={shown.ec_images?.[0]}
      ec_product_id={shown.permanentid}
      clickUri={shown.clickUri}
      variants={<ProductVariants product={shown} onPromote={promote} />}
    />
  );
}

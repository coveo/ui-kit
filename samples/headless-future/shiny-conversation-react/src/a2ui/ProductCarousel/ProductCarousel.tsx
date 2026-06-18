import {useState} from 'react';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import styles from './ProductCarousel.module.css';
import type {ParsedSurface} from '../types.js';

const PAGE_SIZE = 3;

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
  const heading =
    (surface.componentProps.heading as {literalString?: string})
      ?.literalString ?? 'Products';

  const items = (surface.data.items as ProductItem[]) ?? [];
  const [page, setPage] = useState(0);

  if (items.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{heading}</h3>
        {totalPages > 1 && (
          <div className={styles.nav}>
            <button
              className={styles.navButton}
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              aria-label="Previous products"
            >
              ←
            </button>
            <span className={styles.pageIndicator}>
              {page + 1} / {totalPages}
            </span>
            <button
              className={styles.navButton}
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages - 1}
              aria-label="Next products"
            >
              →
            </button>
          </div>
        )}
      </div>
      <div className={styles.track}>
        {visibleItems.map((item, i) => (
          <A2UIProductCard
            key={item.ec_product_id ?? i}
            ec_name={item.ec_name}
            ec_brand={item.ec_brand}
            ec_price={item.ec_price}
            ec_image={item.ec_image}
            ec_product_id={item.ec_product_id}
            clickUri={item.clickUri}
          />
        ))}
      </div>
    </section>
  );
}

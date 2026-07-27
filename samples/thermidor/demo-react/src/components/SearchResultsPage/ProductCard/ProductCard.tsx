import type {Product} from '@coveo/thermidor';
import {resolveProductImage} from '../utils.js';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function ProductCard({product}: ProductCardProps) {
  const imageUrl = resolveProductImage(product);

  const {ec_name: name, ec_brand: brand, ec_price: price, ec_promo_price: promoPrice} = product;

  const hasPromo = promoPrice !== undefined && price !== undefined && promoPrice < price;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img className={styles.image} src={imageUrl} alt={name ?? ''} />
        ) : (
          <div className={styles.imagePlaceholder} aria-label="No image available" />
        )}
      </div>
      <div className={styles.content}>
        {brand && <span className={styles.brand}>{brand}</span>}
        <h3 className={styles.name} title={name ?? ''}>
          {name}
        </h3>
        <div className={styles.pricing}>
          {price === undefined ? (
            <span className={styles.price}>&mdash;</span>
          ) : hasPromo ? (
            <>
              <span className={styles.promoPrice}>{formatPrice(promoPrice!)}</span>
              <span className={styles.originalPrice}>{formatPrice(price)}</span>
            </>
          ) : (
            <span className={styles.price}>{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

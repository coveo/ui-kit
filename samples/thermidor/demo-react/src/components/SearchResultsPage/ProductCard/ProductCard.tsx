import type {Product} from '../utils.js';
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

  const name = product.ec_name as string | undefined;
  const brand = product.ec_brand as string | undefined;
  const price = product.ec_price as number | undefined;
  const promoPrice = product.ec_promo_price as number | undefined;

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

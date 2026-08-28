import type {Product} from '@coveo/thermidor';
import {useTargeting} from '../../../context/targeting.js';
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
  const targeting = useTargeting();

  const {ec_name: name, ec_brand: brand, ec_price: price, ec_promo_price: promoPrice} = product;

  const hasPromo = promoPrice !== undefined && price !== undefined && promoPrice < price;

  const isSelected = targeting?.selectedProductIds.has(product.permanentid ?? '') ?? false;
  const isTargetable = targeting?.isTargeting ?? false;

  const cardClasses = [
    styles.card,
    isTargetable ? styles.targetable : '',
    isSelected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const interactiveProps = isTargetable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        'aria-pressed': isSelected,
        onClick: () =>
          targeting!.onProductTargeted(
            product.permanentid ?? '',
            product.ec_name ?? '',
            imageUrl ?? undefined
          ),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            targeting!.onProductTargeted(
              product.permanentid ?? '',
              product.ec_name ?? '',
              imageUrl ?? undefined
            );
          }
        },
      }
    : {};

  return (
    <article className={cardClasses} {...interactiveProps}>
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

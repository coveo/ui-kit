import {useTargeting} from '../../context/targeting.js';
import {formatPrice} from '../../utils.js';
import styles from './ProductCard.module.css';

interface A2UIProductCardProps {
  ec_name?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
}

export function A2UIProductCard(props: A2UIProductCardProps) {
  const {ec_name, ec_brand, ec_price, ec_image, ec_product_id, clickUri} = props;
  const targeting = useTargeting();

  const productId = ec_product_id ?? ec_name;
  const isSelected = productId ? (targeting?.selectedProductIds.has(productId) ?? false) : false;
  const isTargetable = (targeting?.isTargeting ?? false) && !!productId;

  const cardClasses = [
    styles.card,
    isTargetable ? styles.targetable : '',
    isSelected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleTarget = () => {
    targeting!.onProductTargeted(productId!, ec_name ?? '', ec_image);
  };

  const interactiveProps = isTargetable
    ? {
        role: 'button' as const,
        'aria-pressed': isSelected,
        tabIndex: 0,
        onClick: handleTarget,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTarget();
          }
        },
      }
    : {};

  return (
    <div className={cardClasses} {...interactiveProps}>
      {ec_image && (
        <img className={styles.image} src={ec_image} alt={ec_name ?? 'Product'} loading="lazy" />
      )}
      <div className={styles.content}>
        {clickUri && !isTargetable ? (
          <a className={styles.name} href={clickUri} target="_blank" rel="noopener noreferrer">
            {ec_name}
          </a>
        ) : (
          <span className={styles.name}>{ec_name}</span>
        )}
        {ec_brand && <span className={styles.brand}>{ec_brand}</span>}
        {ec_price !== undefined && <span className={styles.price}>{formatPrice(ec_price)}</span>}
      </div>
    </div>
  );
}

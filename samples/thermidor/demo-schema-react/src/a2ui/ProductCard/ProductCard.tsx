import {useContext} from 'react';
import {formatPrice} from '../../utils.js';
import {ProductCardActionsContext} from './product-card-actions.js';
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
  const renderActions = useContext(ProductCardActionsContext);

  return (
    <div className={styles.card}>
      {ec_image && (
        <img className={styles.image} src={ec_image} alt={ec_name ?? 'Product'} loading="lazy" />
      )}
      <div className={styles.content}>
        {clickUri ? (
          <a className={styles.name} href={clickUri} target="_blank" rel="noopener noreferrer">
            {ec_name}
          </a>
        ) : (
          <span className={styles.name}>{ec_name}</span>
        )}
        {ec_brand && <span className={styles.brand}>{ec_brand}</span>}
        {ec_price !== undefined && <span className={styles.price}>{formatPrice(ec_price)}</span>}
        {renderActions && ec_product_id && (
          <div className={styles.actions}>
            {renderActions({
              productId: ec_product_id,
              name: ec_name ?? ec_product_id,
              price: ec_price,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

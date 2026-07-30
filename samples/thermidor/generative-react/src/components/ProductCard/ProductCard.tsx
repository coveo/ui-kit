import {formatPrice} from '../../utils.js';
import styles from './ProductCard.module.css';

interface Product {
  permanentid: string;
  ec_name: string;
  ec_brand?: string;
  ec_price?: number;
  ec_images?: string[];
  ec_thumbnails?: string[];
  clickUri?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({product}: ProductCardProps) {
  const imageUrl = product.ec_thumbnails?.[0] ?? product.ec_images?.[0];

  return (
    <article className={styles.card}>
      {imageUrl && <img className={styles.image} src={imageUrl} alt={product.ec_name} />}
      <div className={styles.content}>
        <h3 className={styles.name}>{product.ec_name}</h3>
        {product.ec_brand && <span className={styles.brand}>{product.ec_brand}</span>}
        {product.ec_price !== undefined && (
          <span className={styles.price}>{formatPrice(product.ec_price)}</span>
        )}
      </div>
    </article>
  );
}

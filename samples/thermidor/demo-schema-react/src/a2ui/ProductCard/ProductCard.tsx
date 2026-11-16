import {useContext, type ReactNode} from 'react';
import type {Product} from '@coveo/thermidor-schema';
import {formatPrice} from '../../utils.js';
import {ProductChildren} from '../ProductChildren/ProductChildren.js';
import {usePromotedProduct} from '../ProductChildren/use-promoted-product.js';
import {ProductCardActionsContext} from './product-card-actions.js';
import styles from './ProductCard.module.css';

interface A2UIProductCardProps {
  ec_name?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
  /** The product's children, under its name. */
  productChildren?: ReactNode;
}

export function A2UIProductCard(props: A2UIProductCardProps) {
  const {ec_name, ec_brand, ec_price, ec_image, ec_product_id, clickUri, productChildren} = props;
  const renderActions = useContext(ProductCardActionsContext);
  const actions =
    renderActions && ec_product_id
      ? renderActions({
          productId: ec_product_id,
          name: ec_name ?? ec_product_id,
          price: ec_price,
          imageUrl: ec_image,
          clickUri,
        })
      : null;

  return (
    <div className={styles.card}>
      {ec_image && (
        <img className={styles.image} src={ec_image} alt={ec_name ?? 'Product'} loading="lazy" />
      )}
      <div className={styles.content}>
        {clickUri ? (
          <a
            className={styles.name}
            title={ec_name}
            href={clickUri}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ec_name}
          </a>
        ) : (
          <span className={styles.name} title={ec_name}>
            {ec_name}
          </span>
        )}
        {ec_brand && <span className={styles.brand}>{ec_brand}</span>}
        {productChildren}
        {ec_price !== undefined && <span className={styles.price}>{formatPrice(ec_price)}</span>}
        {actions != null && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}

/** A product card whose children can be promoted into it. */
export function PromotableProductCard({product}: {product: Product}) {
  const [shown, promote] = usePromotedProduct(product);
  return (
    <A2UIProductCard
      ec_name={shown.ec_name}
      ec_brand={shown.ec_brand}
      ec_price={shown.ec_promo_price ?? shown.ec_price}
      ec_image={shown.ec_images?.[0]}
      ec_product_id={shown.permanentid}
      clickUri={shown.clickUri}
      productChildren={<ProductChildren product={shown} onPromote={promote} />}
    />
  );
}

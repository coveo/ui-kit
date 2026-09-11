import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {Product, ProductSummaryProps} from '@coveo/thermidor-schema';
import styles from './ProductSummary.module.css';

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

function resolveProductImage(product: Product): string | null {
  const images = product.ec_images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return null;
}

function resolvePrice(product: Product): number | undefined {
  return product.ec_promo_price ?? product.ec_price;
}

export function ProductSummaryRenderer({props}: {props: ProductSummaryProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const state = controller.state;

  if (!state) {
    return (
      <div className={styles.loading} aria-label="Loading product summary">
        Loading…
      </div>
    );
  }

  const {categoryLabel, product} = state;
  const name = product?.ec_name ?? categoryLabel;
  const imageUrl = product ? resolveProductImage(product) : null;
  const price = product ? resolvePrice(product) : undefined;

  return (
    <div className={styles.itemRow} role="listitem">
      {imageUrl ? (
        <img className={styles.itemImage} src={imageUrl} alt={name ?? ''} />
      ) : (
        <div className={styles.itemImage} aria-label="No image available" />
      )}
      <div className={styles.itemInfo}>
        <span className={styles.itemName} title={name ?? ''}>
          {name}
        </span>
        {product?.ec_shortdesc && (
          <span className={styles.itemDescription} title={product.ec_shortdesc}>
            {product.ec_shortdesc}
          </span>
        )}
        {price !== undefined && <span className={styles.itemPrice}>{formatPrice(price)}</span>}
      </div>
    </div>
  );
}

import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {Product} from '@coveo/thermidor-schema';
import {ProductSummaryPropsSchema} from '@coveo/thermidor-schema/zod3';
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

/**
 * A2-UI component for the `product-summary`: a compact single-product summary row for a bundle
 * category slot. The generic binder resolves `categoryLabel` / `product` from
 * `ProductSummaryPropsSchema`. Presentational — no actions. `categoryLabel === undefined`
 * (bindings not yet resolved) renders a loading state.
 */
export const ProductSummary = createReactComponent(
  {
    name: 'ProductSummary',
    schema: ProductSummaryPropsSchema,
  },
  ({props}) => {
    if (props.categoryLabel === undefined) {
      return (
        <div className={styles.loading} aria-label="Loading product summary">
          Loading…
        </div>
      );
    }

    const {categoryLabel, product} = props;
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
);

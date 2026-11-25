import {useContext} from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import type {Product} from '@coveo/thermidor-schema';
import {ProductSummaryPropsSchema} from '@coveo/thermidor-schema/zod3';
import {ProductCardActionsContext} from '../ProductCard/product-card-actions.js';
import {formatConfiguredPrice as formatPrice} from '../../context/format-configured-price.js';
import styles from './ProductSummary.module.css';

function resolveProductImage(product: Product): string | null {
  const images = product.ec_images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return null;
}

function resolvePrice(product: Product): number | undefined {
  const {ec_price: price, ec_promo_price: promoPrice} = product;
  if (promoPrice === undefined) {
    return price;
  }
  return price === undefined || promoPrice < price ? promoPrice : price;
}

/**
 * A2-UI component for the `product-summary`: a compact single-product summary row for a bundle
 * category slot. The generic binder resolves `categoryLabel` / `product` from
 * `ProductSummaryPropsSchema`. No surface actions; the row renders the
 * `ProductCardActionsContext` actions for its product. `categoryLabel === undefined` (bindings not
 * yet resolved) renders a loading state.
 */
export const ProductSummary = createComponentImplementation(
  {
    name: 'ProductSummary',
    schema: ProductSummaryPropsSchema,
  },
  ({props}) => {
    const renderActions = useContext(ProductCardActionsContext);

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
    const actions =
      product &&
      renderActions?.({
        productId: product.permanentid,
        name: product.ec_name ?? product.permanentid,
        price,
        imageUrl: imageUrl ?? undefined,
        clickUri: product.clickUri,
      });

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
        {actions != null && <div className={styles.itemActions}>{actions}</div>}
      </div>
    );
  }
);

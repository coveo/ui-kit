import {useContext, useEffect} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {Product} from '@coveo/thermidor-schema';
import {ProductSummaryPropsSchema} from '@coveo/thermidor-schema/zod3';
import {BundleSlotProductContext} from '../BundleDisplay/bundle-actions.js';
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
 * `ProductSummaryPropsSchema`. Presentational — no actions; inside a bundle slot it reports its
 * product through `BundleSlotProductContext`. `categoryLabel === undefined` (bindings not yet
 * resolved) renders a loading state.
 */
export const ProductSummary = createReactComponent(
  {
    name: 'ProductSummary',
    schema: ProductSummaryPropsSchema,
  },
  ({props}) => {
    const reportToBundle = useContext(BundleSlotProductContext);
    const productId = props.product?.permanentid;
    const productName = props.product?.ec_name ?? productId;
    const productPrice = props.product ? resolvePrice(props.product) : undefined;
    const productImageUrl = props.product ? resolveProductImage(props.product) : null;
    const productClickUri = props.product?.clickUri;

    useEffect(() => {
      if (!reportToBundle) return;
      reportToBundle(
        productId && productName
          ? {
              productId,
              name: productName,
              price: productPrice,
              imageUrl: productImageUrl ?? undefined,
              clickUri: productClickUri,
            }
          : null
      );
      return () => reportToBundle(null);
    }, [reportToBundle, productId, productName, productPrice, productImageUrl, productClickUri]);

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

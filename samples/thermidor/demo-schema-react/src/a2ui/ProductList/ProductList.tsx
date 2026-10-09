import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {Product} from '@coveo/thermidor-schema';
import {ProductListPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useStale} from '../pending-dispatch.js';
import freshness from '../result-freshness.module.css';
import styles from './ProductList.module.css';

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

function ProductCard({product}: {product: Product}) {
  const imageUrl = resolveProductImage(product);
  const {ec_name: name, ec_brand: brand, ec_price: price, ec_promo_price: promoPrice} = product;
  const hasPromo = promoPrice !== undefined && price !== undefined && promoPrice < price;

  return (
    <article className={styles.card} role="listitem">
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

/**
 * A2-UI component for the `product-list`. The generic binder resolves `products` from
 * `ProductListPropsSchema`; a grid of product cards for decomposed commerce search surfaces.
 * Presentational — no actions. `products === undefined` (bindings not yet resolved) renders a
 * loading state; an empty list renders nothing.
 *
 * Optimistic highlighting on a facet, a sort or a page control would otherwise read as a lie here:
 * the control says page 3 while this grid still holds page 2. Dimming says which of the two the
 * backend has caught up with.
 */
export const ProductList = createReactComponent(
  {name: 'ProductList', schema: ProductListPropsSchema},
  ({props}) => {
    const products = props.products;
    const outstanding = useStale('results');

    if (products === undefined) {
      return (
        <div className={styles.loading} aria-label="Loading product list">
          Loading products…
        </div>
      );
    }

    if (products.length === 0) {
      return null;
    }

    return (
      <section className={outstanding ? freshness.stale : undefined} aria-busy={outstanding}>
        <div className={styles.grid} role="list" aria-label="Product list">
          {products.map((product) => (
            <ProductCard key={product.permanentid} product={product} />
          ))}
        </div>
      </section>
    );
  }
);

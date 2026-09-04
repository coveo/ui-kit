import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {Product, ProductListProps} from '@coveo/thermidor-schema';
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

export function ProductListRenderer({props}: {props: ProductListProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const products = controller.state?.products ?? [];

  if (!controller.state) {
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
    <section>
      <div className={styles.grid} role="list" aria-label="Product list">
        {products.map((product: Product) => (
          <ProductCard key={product.permanentid} product={product} />
        ))}
      </div>
    </section>
  );
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

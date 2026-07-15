import type {Product} from '@coveo/thermidor';
import {productListController} from '../../commerce-setup.js';
import {useController} from '../../hooks/use-controller.js';
import styles from './ProductList.module.css';

function getProductImage(product: Product): string | undefined {
  return product.ec_thumbnails?.[0] ?? product.ec_images?.[0];
}

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

function ProductCard({product}: {product: Product}) {
  const image = getProductImage(product);
  const hasPromo =
    product.ec_promo_price != null &&
    product.ec_price != null &&
    product.ec_promo_price < product.ec_price;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {image ? (
          <img
            className={styles.image}
            src={image}
            alt={product.ec_name}
            loading="lazy"
          />
        ) : (
          <span className={styles.imagePlaceholder}>No image</span>
        )}
      </div>
      <div className={styles.content}>
        {product.ec_brand && (
          <span className={styles.brand}>{product.ec_brand}</span>
        )}
        <h3 className={styles.name}>
          {product.clickUri ? (
            <a
              href={product.clickUri}
              className={styles.nameLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {product.ec_name}
            </a>
          ) : (
            product.ec_name
          )}
        </h3>
        <div className={styles.pricing}>
          {hasPromo ? (
            <>
              <span className={styles.promoPrice}>
                {formatPrice(product.ec_promo_price!)}
              </span>
              <span className={styles.originalPrice}>
                {formatPrice(product.ec_price!)}
              </span>
            </>
          ) : product.ec_price != null ? (
            <span className={styles.price}>
              {formatPrice(product.ec_price)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProductList() {
  const state = useController(productListController);

  if (state.products.length === 0) {
    return <p className={styles.empty}>No products to display.</p>;
  }

  return (
    <section className={styles.grid} aria-label="Product list">
      {state.products.map((product) => (
        <ProductCard key={product.permanentid} product={product} />
      ))}
    </section>
  );
}

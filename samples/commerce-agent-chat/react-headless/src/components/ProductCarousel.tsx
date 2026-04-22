import {
  formatPrice,
  hasDiscount,
  promoPrice,
} from '../../../core/src/lib/commerceHelpers.js';
import type {Product} from '../types/commerce.js';

import './ProductCarousel.css';

interface ProductSection {
  heading: string;
  products: Product[];
}

interface ProductCarouselProps {
  sections: ProductSection[];
  isLoading: boolean;
}

function getProductHref(product: Product): string {
  const candidate =
    product['clickUri'] ?? product['ec_product_url'] ?? product['url'];

  if (typeof candidate !== 'string') {
    return '';
  }

  const value = candidate.trim();
  return !value || /^javascript:/i.test(value) ? '' : value;
}

function ProductPrice({product}: {product: Product}): React.JSX.Element {
  const hasPromoDiscount = hasDiscount(product);
  const regularPrice = formatPrice(product.ec_price);
  const promotionalPrice = formatPrice(promoPrice(product));

  if (!hasPromoDiscount) {
    return (
      <span className="rh-product-price">
        <span className="rh-product-price-regular">{regularPrice}</span>
      </span>
    );
  }

  return (
    <span className="rh-product-price">
      <span className="rh-product-price-original">{regularPrice}</span>
      <span className="rh-product-price-promo">{promotionalPrice}</span>
    </span>
  );
}

function ProductCard({product}: {product: Product}): React.JSX.Element {
  const href = getProductHref(product);

  return (
    <div role="listitem" className="rh-carousel-track__item">
      <article className="rh-product-card">
        {product.ec_image ? (
          <img
            className="rh-product-image"
            src={product.ec_image}
            alt={product.ec_name}
            loading="lazy"
          />
        ) : (
          <div className="rh-product-image-placeholder" aria-hidden="true" />
        )}
        <div className="rh-product-card__body">
          {href ? (
            <a className="rh-product-name" href={href}>
              {product.ec_name}
            </a>
          ) : (
            <span className="rh-product-name rh-product-name--text">
              {product.ec_name}
            </span>
          )}
          {product.ec_brand ? (
            <p className="rh-product-brand">{product.ec_brand}</p>
          ) : null}
          <ProductPrice product={product} />
        </div>
      </article>
    </div>
  );
}

function LoadingSection(): React.JSX.Element {
  return (
    <div className="rh-carousel-section" aria-busy="true">
      <h3 className="commerce-heading" aria-hidden="true">
        <span className="rh-commerce-loading rh-commerce-loading--heading" />
      </h3>
      <div
        className="rh-carousel-track"
        role="list"
        aria-label="Loading products"
      >
        {Array.from({length: 4}, (_, index) => (
          <div key={index} role="listitem" className="rh-carousel-track__item">
            <div className="rh-product-card rh-product-card--skeleton">
              <div className="rh-product-card__image rh-commerce-loading rh-commerce-loading--image" />
              <div className="rh-product-card__body">
                <div className="rh-commerce-loading rh-commerce-loading--line" />
                <div className="rh-commerce-loading rh-commerce-loading--line rh-commerce-loading--line-wide" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCarousel({
  sections,
  isLoading,
}: ProductCarouselProps): React.JSX.Element | null {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="rh-product-carousel">
      {sections.map((section, index) => {
        const sectionKey = `${section.heading}-${index}`;

        if (isLoading && section.products.length === 0) {
          return <LoadingSection key={sectionKey} />;
        }

        return (
          <div key={sectionKey} className="rh-carousel-section">
            <h3 className="commerce-heading">{section.heading}</h3>
            <div className="rh-carousel-track" role="list">
              {section.products.map((product) => (
                <ProductCard
                  key={product.ec_product_id || product.ec_name}
                  product={product}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

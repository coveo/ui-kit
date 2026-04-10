import type {Product} from '../../types/commerce.js';
import {PriceDisplay} from './PriceDisplay.js';
import './ProductCarousel.css';

export interface ProductSection {
  heading: string;
  products: Product[];
}

interface ProductCarouselProps {
  sections: ProductSection[];
  isLoading?: boolean;
}

function ProductCard({product}: {product: Product}) {
  return (
    <article className="product-card">
      {product.ec_image ? (
        <img
          src={product.ec_image}
          alt={product.ec_name}
          className="product-card__image"
        />
      ) : (
        <div
          className="product-card__image product-card__image--placeholder"
          aria-hidden="true"
        />
      )}
      <div className="product-card__body">
        <p className="product-card__name">{product.ec_name}</p>
        <p className="product-card__brand">{product.ec_brand}</p>
        <PriceDisplay product={product} />
      </div>
    </article>
  );
}

function SectionCarousel({
  heading,
  products,
  isLoading,
}: ProductSection & {isLoading: boolean}) {
  if (isLoading && products.length === 0) {
    return (
      <div className="carousel-section" aria-busy="true">
        <h3 className="commerce-heading">{heading}</h3>
        <div
          className="carousel-track"
          role="list"
          aria-label="Loading products"
        >
          {Array.from({length: 3}, (_, i) => (
            <div
              key={`carousel-skeleton-${i}`}
              role="listitem"
              className="carousel-track__item"
            >
              <div className="product-card product-card--skeleton">
                <div className="product-card__image commerce-loading commerce-loading--image" />
                <div className="product-card__body">
                  <div className="commerce-loading commerce-loading--line" />
                  <div className="commerce-loading commerce-loading--line commerce-loading--line-wide" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-section">
      <h3 className="commerce-heading">{heading}</h3>
      <div className="carousel-track" role="list">
        {products.map((product) => (
          <div
            key={product.ec_product_id}
            role="listitem"
            className="carousel-track__item"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCarousel({
  sections,
  isLoading = false,
}: ProductCarouselProps) {
  if (sections.length === 0) return null;
  return (
    <div className="product-carousel">
      {sections.map((section, i) => (
        <SectionCarousel
          key={`${section.heading}-${i}`}
          {...section}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

import type {Product} from '@coveo/headless/commerce';
import {formatPrice} from '../../../core/src/lib/commerceHelpers.js';

import './SearchResults.css';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  query: string;
  error?: string | null;
}

function getProductImage(product: Product): string {
  return product.ec_images?.[0] ?? product.ec_thumbnails?.[0] ?? '';
}

function getProductTitle(product: Product): string {
  return product.ec_name ?? '';
}

function getProductPrice(product: Product): string {
  const rawPrice = product.ec_promo_price ?? product.ec_price;
  if (typeof rawPrice !== 'number') {
    return '';
  }
  return formatPrice(rawPrice);
}

function ProductCard({product}: {product: Product}): React.JSX.Element {
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const price = getProductPrice(product);

  return (
    <article className="rh-search-card">
      {image ? (
        <img
          className="rh-search-card__image"
          src={image}
          alt={title}
          loading="lazy"
        />
      ) : (
        <div
          className="rh-search-card__image--placeholder"
          aria-hidden="true"
        />
      )}
      <div className="rh-search-card__body">
        <p className="rh-search-card__title">{title}</p>
        <p className="rh-search-card__price">{price}</p>
      </div>
    </article>
  );
}

export function SearchResults({
  products,
  isLoading,
  query,
  error = null,
}: SearchResultsProps): React.JSX.Element {
  return (
    <section className="rh-search-results" aria-label="Search results">
      {query ? (
        <div className="rh-search-query">
          Results for <strong>{query}</strong>
        </div>
      ) : null}
      {error && !isLoading ? (
        <div className="rh-search-error" role="alert">
          {error}
        </div>
      ) : null}
      {isLoading && products.length === 0 ? (
        <div className="rh-search-loading" aria-live="polite" aria-busy="true">
          <div className="rh-search-spinner" />
          <span>Loading results...</span>
        </div>
      ) : null}
      {!isLoading && products.length === 0 ? (
        <div className="rh-search-empty">
          <div className="rh-search-empty-icon" aria-hidden="true">
            🔍
          </div>
          <p className="rh-search-empty-text">
            {query ? 'No results found' : 'Enter a search query to see results'}
          </p>
        </div>
      ) : null}
      {products.length > 0 ? (
        <div className="rh-search-grid">
          {products.map((product) => (
            <ProductCard
              key={product.ec_product_id ?? product.permanentid}
              product={product}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

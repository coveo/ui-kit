import {
  formatAttribute,
  formatPrice,
  hasDiscount,
  promoPrice,
} from '../lib/commerceHelpers.js';
import type {Product} from '../types/commerce.js';

import './ComparisonTable.css';

interface ComparisonTableProps {
  heading: string;
  products: Product[];
  comparisonAttributes: string[];
  isLoading: boolean;
}

function PriceDisplay({product}: {product: Product}): React.JSX.Element {
  const hasPromoDiscount = hasDiscount(product);
  const regularPrice = formatPrice(product.ec_price);
  const promotionalPrice = formatPrice(promoPrice(product));

  if (!hasPromoDiscount) {
    return (
      <span className="rh-price-display">
        <span className="rh-price-regular">{regularPrice}</span>
      </span>
    );
  }

  return (
    <span className="rh-price-display">
      <span className="rh-price-original">{regularPrice}</span>
      <span className="rh-price-promo">{promotionalPrice}</span>
    </span>
  );
}

export function ComparisonTable({
  heading,
  products,
  comparisonAttributes,
  isLoading,
}: ComparisonTableProps): React.JSX.Element | null {
  if (products.length === 0) {
    if (!isLoading) {
      return null;
    }

    return (
      <div className="rh-comparison-table-wrap" aria-busy="true">
        <h3 className="commerce-heading">{heading}</h3>
        <div className="rh-comparison-table-loading">
          <div className="rh-comparison-table-loading__line" />
          <div className="rh-comparison-table-loading__line rh-comparison-table-loading__line--wide" />
          <div className="rh-comparison-table-loading__grid">
            <div className="rh-comparison-table-loading__cell" />
            <div className="rh-comparison-table-loading__cell" />
            <div className="rh-comparison-table-loading__cell" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-comparison-table-wrap">
      <h3 className="commerce-heading">{heading}</h3>
      <div className="rh-comparison-table-scroll">
        <table className="rh-comparison-table">
          <thead>
            <tr>
              <th className="rh-comparison-table__attr-col">Attribute</th>
              {products.map((product) => (
                <th key={product.ec_product_id || product.ec_name}>
                  {product.ec_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="rh-comparison-table__label">Image</td>
              {products.map((product) => (
                <td key={`image-${product.ec_product_id || product.ec_name}`}>
                  {product.ec_image ? (
                    <img
                      src={product.ec_image}
                      alt={product.ec_name}
                      className="rh-comparison-table__thumb"
                    />
                  ) : (
                    <span className="rh-text-muted">No image</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="rh-comparison-table__label">Brand</td>
              {products.map((product) => (
                <td key={`brand-${product.ec_product_id || product.ec_name}`}>
                  {product.ec_brand}
                </td>
              ))}
            </tr>
            <tr>
              <td className="rh-comparison-table__label">Price</td>
              {products.map((product) => (
                <td key={`price-${product.ec_product_id || product.ec_name}`}>
                  <PriceDisplay product={product} />
                </td>
              ))}
            </tr>
            {comparisonAttributes.map((attribute) => (
              <tr key={attribute}>
                <td className="rh-comparison-table__label">
                  {formatAttribute(attribute)}
                </td>
                {products.map((product) => {
                  const value = product[attribute];
                  return (
                    <td
                      key={`${attribute}-${product.ec_product_id || product.ec_name}`}
                    >
                      {value != null ? (
                        String(value)
                      ) : (
                        <span className="rh-text-muted">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

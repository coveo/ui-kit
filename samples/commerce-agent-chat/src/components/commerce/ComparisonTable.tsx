import type {Product} from '../../types/commerce.js';
import {PriceDisplay} from './PriceDisplay.js';
import './ComparisonTable.css';

interface ComparisonTableProps {
  heading: string;
  products: Product[];
  attributes?: string[];
  isLoading?: boolean;
}

function formatAttributeLabel(attribute: string): string {
  return attribute
    .replace(/^ec_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ComparisonTable({
  heading,
  products,
  attributes = [],
  isLoading = false,
}: ComparisonTableProps) {
  if (products.length === 0) {
    if (!isLoading) {
      return null;
    }

    return (
      <div className="comparison-table-wrap" aria-busy="true">
        <h3 className="commerce-heading">{heading}</h3>
        <div className="comparison-table-loading">
          <div className="comparison-table-loading__line" />
          <div className="comparison-table-loading__line comparison-table-loading__line--wide" />
          <div className="comparison-table-loading__grid">
            <div className="comparison-table-loading__cell" />
            <div className="comparison-table-loading__cell" />
            <div className="comparison-table-loading__cell" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-table-wrap">
      <h3 className="commerce-heading">{heading}</h3>
      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-table__attr-col">Attribute</th>
              {products.map((p) => (
                <th key={p.ec_product_id}>{p.ec_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comparison-table__label">Image</td>
              {products.map((p) => (
                <td key={p.ec_product_id}>
                  {p.ec_image ? (
                    <img
                      src={p.ec_image}
                      alt={p.ec_name}
                      className="comparison-table__thumb"
                    />
                  ) : (
                    <span className="text-muted">No image</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-table__label">Brand</td>
              {products.map((p) => (
                <td key={p.ec_product_id}>{p.ec_brand}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-table__label">Price</td>
              {products.map((p) => (
                <td key={p.ec_product_id}>
                  <PriceDisplay product={p} />
                </td>
              ))}
            </tr>
            {attributes.map((attr) => (
              <tr key={attr}>
                <td className="comparison-table__label">
                  {formatAttributeLabel(attr)}
                </td>
                {products.map((p) => (
                  <td key={p.ec_product_id}>
                    {p[attr] != null ? (
                      String(p[attr])
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

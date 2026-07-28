import {useState} from 'react';
import {formatPrice} from '../../utils.js';
import styles from './ComparisonTable.module.css';
import type {ParsedSurface} from '../types.js';

const MAX_VISIBLE = 3;

interface A2UIComparisonTableProps {
  surface: ParsedSurface;
}

interface ComparisonItem {
  ec_name?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
  [key: string]: unknown;
}

export function A2UIComparisonTable({surface}: A2UIComparisonTableProps) {
  const heading = (surface.componentProps.heading as {literalString?: string})?.literalString ?? '';

  const attributes = (surface.componentProps.attributes as string[]) ?? [
    'standout',
    'trade_off',
    'best_for',
  ];

  const rawItems = surface.data.items;
  let items: ComparisonItem[] = [];

  if (Array.isArray(rawItems)) {
    items = rawItems as ComparisonItem[];
  } else if (rawItems && typeof rawItems === 'object') {
    items = Object.values(rawItems) as ComparisonItem[];
  }

  const [startIndex, setStartIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  const attributeLabels: Record<string, string> = {
    standout: 'Standout',
    trade_off: 'Trade-off',
    best_for: 'Best for',
    capacity: 'Capacity',
  };

  const displayAttributes = attributes.filter((attr) => attr !== 'price');
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + MAX_VISIBLE < items.length;
  const visibleItems = items.slice(startIndex, startIndex + MAX_VISIBLE);

  return (
    <section className={styles.container}>
      {heading && <h3 className={styles.heading}>{heading}</h3>}
      <div className={styles.tableWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
            aria-label="Show previous products"
          >
            ‹
          </button>
        )}
        <div className={styles.table} role="table" aria-label={heading || 'Product comparison'}>
          <div className={styles.row} role="row">
            <div className={styles.labelCell} role="columnheader">
              Product
            </div>
            {visibleItems.map((item, i) => (
              <div key={item.ec_product_id ?? i} className={styles.productCell} role="columnheader">
                {item.ec_image && (
                  <img
                    className={styles.productImage}
                    src={item.ec_image}
                    alt={item.ec_name ?? 'Product'}
                    loading="lazy"
                  />
                )}
                <span className={styles.productName}>{item.ec_name}</span>
              </div>
            ))}
          </div>

          <div className={styles.row} role="row">
            <div className={styles.labelCell} role="rowheader">
              Price
            </div>
            {visibleItems.map((item, i) => (
              <div
                key={`price-${item.ec_product_id ?? i}`}
                className={styles.valueCell}
                role="cell"
              >
                <span className={styles.priceValue}>
                  {item.ec_price !== undefined ? formatPrice(item.ec_price) : '—'}
                </span>
              </div>
            ))}
          </div>

          {displayAttributes.map((attr) => (
            <div key={attr} className={styles.row} role="row">
              <div className={styles.labelCell} role="rowheader">
                {attributeLabels[attr] ?? attr}
              </div>
              {visibleItems.map((item, i) => {
                const value = item[attr];
                return (
                  <div
                    key={`${attr}-${item.ec_product_id ?? i}`}
                    className={styles.valueCell}
                    role="cell"
                  >
                    {typeof value === 'string' ? value : '—'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={() => setStartIndex((i) => Math.min(items.length - MAX_VISIBLE, i + 1))}
            aria-label="Show next products"
          >
            ›
          </button>
        )}
      </div>
      {items.length > MAX_VISIBLE && (
        <div className={styles.pageInfo}>
          Showing {startIndex + 1}–{Math.min(startIndex + MAX_VISIBLE, items.length)} of{' '}
          {items.length}
        </div>
      )}
    </section>
  );
}

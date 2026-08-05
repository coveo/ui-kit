import {useState} from 'react';
import {useTargeting} from '../../context/targeting.js';
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
  const heading = extractHeading(surface);
  const attributes = extractAttributes(surface);
  const items = extractItems(surface);
  const targeting = useTargeting();
  const isTargetable = targeting?.isTargeting ?? false;

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
            {visibleItems.map((item, i) => {
              const productId = item.ec_product_id ?? '';
              const isSelected = targeting?.selectedProductIds.has(productId) ?? false;

              const cellClasses = [
                styles.productCell,
                isTargetable ? styles.targetable : '',
                isSelected ? styles.selected : '',
              ]
                .filter(Boolean)
                .join(' ');

              const interactiveProps = isTargetable
                ? {
                    role: 'button' as const,
                    tabIndex: 0,
                    onClick: () =>
                      targeting!.onProductTargeted(productId, item.ec_name ?? '', item.ec_image),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        targeting!.onProductTargeted(productId, item.ec_name ?? '', item.ec_image);
                      }
                    },
                  }
                : {};

              return (
                <div key={item.ec_product_id ?? i} className={cellClasses} {...interactiveProps}>
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
              );
            })}
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

function extractHeading(surface: ParsedSurface): string {
  const dataHeading = surface.data.heading as {value?: string} | string | undefined;
  if (typeof dataHeading === 'string') return dataHeading;
  if (dataHeading && typeof dataHeading === 'object' && 'value' in dataHeading)
    return dataHeading.value ?? '';
  return (surface.componentProps.heading as {literalString?: string})?.literalString ?? '';
}

function extractAttributes(surface: ParsedSurface): string[] {
  if (Array.isArray(surface.data.attributes)) {
    return surface.data.attributes as string[];
  }
  const dataAttrs = surface.data.attributes as {items?: string[]} | undefined;
  if (dataAttrs?.items) return dataAttrs.items;
  return (surface.componentProps.attributes as string[]) ?? ['standout', 'trade_off', 'best_for'];
}

function extractItems(surface: ParsedSurface): ComparisonItem[] {
  const products = surface.data.products as {items?: ComparisonItem[]} | undefined;
  if (products?.items) return products.items;
  const dataItems = surface.data.items;
  if (Array.isArray(dataItems)) return dataItems as ComparisonItem[];
  if (dataItems && typeof dataItems === 'object')
    return Object.values(dataItems) as ComparisonItem[];
  return [];
}

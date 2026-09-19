import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {
  ComparisonTableProps,
  ComparisonAttribute,
  ComparisonProduct,
} from '@coveo/thermidor-schema';
import styles from './ComparisonTable.module.css';

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * A2-UI leaf renderer for the `comparison-table` component. It reads its heading, AI
 * summary, compared products, and attribute descriptors from its own AG-UI state and
 * renders the aligned comparison grid: a header row with each product's image and name,
 * a price row, and one row per attribute (excluding `brand`). Read-only: the framing,
 * products, and attributes are owned by the backend and correlated solely by componentId.
 */
export function ComparisonTableRenderer({props}: {props: ComparisonTableProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const heading = controller.state?.heading ?? '';
  const summary = controller.state?.summary ?? '';
  const products = controller.state?.products ?? [];
  const attributes = controller.state?.attributes ?? [];

  if (products.length === 0) {
    return null;
  }

  // Left label column plus one 1fr column per compared product, so the grid stays
  // aligned for any number of columns.
  const gridTemplateColumns = `100px repeat(${products.length}, 1fr)`;

  return (
    <>
      <section className={styles.container}>
        <h3 className={styles.heading}>{heading}</h3>
        <div className={styles.tableWrapper}>
          <div className={styles.table} role="table" aria-label={heading}>
            <div className={styles.row} role="row" style={{gridTemplateColumns}}>
              <div className={styles.labelCell} role="columnheader">
                Product
              </div>
              {products.map((product: ComparisonProduct) => (
                <div key={product.productId} className={styles.productCell} role="columnheader">
                  {product.imageUrl && (
                    <img
                      className={styles.productImage}
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                  )}
                  <span className={styles.productName}>{product.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.row} role="row" style={{gridTemplateColumns}}>
              <div className={styles.labelCell} role="rowheader">
                Price
              </div>
              {products.map((product: ComparisonProduct) => (
                <div key={`price-${product.productId}`} className={styles.valueCell} role="cell">
                  <span className={styles.priceValue}>
                    {product.price !== undefined ? formatPrice(product.price) : '—'}
                  </span>
                </div>
              ))}
            </div>
            {attributes
              .filter((attr: ComparisonAttribute) => attr.key !== 'brand')
              .map((attr: ComparisonAttribute) => (
                <div key={attr.key} className={styles.row} role="row" style={{gridTemplateColumns}}>
                  <div className={styles.labelCell} role="rowheader">
                    {attr.label}
                  </div>
                  {products.map((product: ComparisonProduct) => (
                    <div
                      key={`${attr.key}-${product.productId}`}
                      className={styles.valueCell}
                      role="cell"
                    >
                      {product.values?.[attr.key] ?? '—'}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </section>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryIcon} aria-hidden="true">
            ✦
          </span>
          <span className={styles.summaryLabel}>AI Summary</span>
        </div>
        <div className={styles.summaryText}>{summary}</div>
      </div>
    </>
  );
}

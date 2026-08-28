import {useAdvertisedController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {
  ComparisonTableProps,
  ComparisonProduct,
  ComparisonAttribute,
} from '@coveo/thermidor-schema';
import styles from './ComparisonTable.module.css';

export function ComparisonTableRenderer({props}: {props: ComparisonTableProps}) {
  const stateSource = useStateSource();
  const controller = useAdvertisedController(
    stateSource,
    props.controllers.comparisonTableController
  );
  const products = controller.state?.products ?? [];
  const attributes = controller.state?.attributes ?? [];

  if (products.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const summaryText =
    "All three wetsuits excel at cold-water protection with premium seam construction and 3-year warranties. ThermoFlex stands out with 7mm thickness for extreme conditions, while both O'Neill options use sustainable materials and offer excellent flexibility. Choose ThermoFlex for maximum warmth in the coldest waters, ZenSurf for proven durability and ratings, or EcoWave for sustainability and UV protection.";

  return (
    <>
      <section className={styles.container}>
        <h3 className={styles.heading}>Cold-Water Surfing Wetsuits Comparison</h3>
        <div className={styles.tableWrapper}>
          <div
            className={styles.table}
            role="table"
            aria-label="Cold-Water Surfing Wetsuits Comparison"
          >
            <div className={styles.row} role="row">
              <div className={styles.labelCell} role="columnheader">
                Product
              </div>
              {products.map((p: ComparisonProduct) => (
                <div key={p.productId} className={styles.productCell}>
                  {p.imageUrl && (
                    <img
                      className={styles.productImage}
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                    />
                  )}
                  <span className={styles.productName}>{p.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.row} role="row">
              <div className={styles.labelCell} role="rowheader">
                Price
              </div>
              {products.map((p: ComparisonProduct) => (
                <div key={`price-${p.productId}`} className={styles.valueCell} role="cell">
                  <span className={styles.priceValue}>
                    {p.price !== undefined ? formatPrice(p.price) : '—'}
                  </span>
                </div>
              ))}
            </div>
            {attributes
              .filter((attr: ComparisonAttribute) => attr.key !== 'brand')
              .map((attr: ComparisonAttribute) => (
                <div key={attr.key} className={styles.row} role="row">
                  <div className={styles.labelCell} role="rowheader">
                    {attr.label}
                  </div>
                  {products.map((p: ComparisonProduct) => (
                    <div
                      key={`${attr.key}-${p.productId}`}
                      className={styles.valueCell}
                      role="cell"
                    >
                      {p.values[attr.key] ?? '—'}
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
        <div className={styles.summaryText}>{summaryText}</div>
      </div>
    </>
  );
}

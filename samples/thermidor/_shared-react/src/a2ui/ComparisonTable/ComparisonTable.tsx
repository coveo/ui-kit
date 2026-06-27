import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import styles from './ComparisonTable.module.css';

interface ComparisonItem {
  ec_name?: string;
  ec_brand?: string;
  ec_price?: number;
  ec_image?: string;
  ec_product_id?: string;
  clickUri?: string;
  standout?: string;
  trade_off?: string;
  best_for?: string;
}

interface A2UIComparisonTableProps {
  heading: string;
  attributes: string[];
  items: ComparisonItem[];
}

export function A2UIComparisonTable({
  heading,
  attributes,
  items,
}: A2UIComparisonTableProps) {
  if (items.length === 0) {
    return null;
  }

  const attributeLabels: Record<string, string> = {
    standout: 'Standout',
    trade_off: 'Trade-off',
    best_for: 'Best for',
  };

  return (
    <section className={styles.container}>
      {heading && <h3 className={styles.heading}>{heading}</h3>}
      <div className={styles.grid}>
        {items.map((item, i) => (
          <div key={item.ec_product_id ?? i} className={styles.column}>
            <A2UIProductCard
              ec_name={item.ec_name}
              ec_brand={item.ec_brand}
              ec_price={item.ec_price}
              ec_image={item.ec_image}
              ec_product_id={item.ec_product_id}
              clickUri={item.clickUri}
            />
            <div className={styles.attributes}>
              {attributes.map((attr) => {
                const value = item[attr as keyof ComparisonItem];
                if (!value || typeof value !== 'string') return null;
                return (
                  <div key={attr} className={styles.attribute}>
                    <span className={styles.attrLabel}>
                      {attributeLabels[attr] ?? attr}
                    </span>
                    <span className={styles.attrValue}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

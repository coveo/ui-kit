import styles from './InlineCarousel.module.css';

interface InlineCarouselProps {
  heading?: string;
  products: Record<string, unknown>[];
}

export function InlineCarousel({heading, products}: InlineCarouselProps) {
  if (!products.length) return null;

  return (
    <div className={styles.container}>
      {heading && <div className={styles.heading}>{heading}</div>}
      <div className={styles.track}>
        {products.map((product, i) => (
          <div key={(product as any).permanentid ?? i} className={styles.card}>
            {(product as any).ec_thumbnails?.[0] && (
              <img
                src={(product as any).ec_thumbnails[0]}
                alt=""
                className={styles.thumb}
              />
            )}
            <div className={styles.name}>
              {(product as any).ec_name ?? 'Untitled'}
            </div>
            <div className={styles.price}>
              ${(product as any).ec_price ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

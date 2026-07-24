import styles from './Skeleton.module.css';

interface A2UISkeletonProps {
  componentType: string;
}

export function A2UISkeleton({componentType}: A2UISkeletonProps) {
  switch (componentType) {
    case 'ProductCarousel':
      return <ProductCarouselSkeleton />;
    case 'BundleDisplay':
      return <BundleDisplaySkeleton />;
    case 'ComparisonTable':
      return <ComparisonTableSkeleton />;
    case 'NextActionsBar':
      return <NextActionsBarSkeleton />;
    case 'ComparisonSummary':
      return <ComparisonSummarySkeleton />;
    default:
      return <GenericSkeleton />;
  }
}

function ProductCarouselSkeleton() {
  return (
    <div
      className={styles.carouselContainer}
      aria-label="Loading product carousel"
    >
      <div className={`${styles.skeleton} ${styles.carouselHeading}`} />
      <div className={styles.carouselTrack}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.carouselCard}>
            <div className={`${styles.skeleton} ${styles.carouselImage}`} />
            <div className={styles.carouselCardContent}>
              <div className={`${styles.skeleton} ${styles.carouselName}`} />
              <div className={`${styles.skeleton} ${styles.carouselPrice}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BundleDisplaySkeleton() {
  return (
    <div className={styles.bundleContainer} aria-label="Loading bundle display">
      <div className={`${styles.skeleton} ${styles.bundleHeading}`} />
      <div className={styles.bundleTabs}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${styles.skeleton} ${styles.bundleTab}`} />
        ))}
      </div>
      <div className={`${styles.skeleton} ${styles.bundleDescription}`} />
      <div className={styles.bundleItems}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.bundleRow}>
            <div className={`${styles.skeleton} ${styles.bundleRowImage}`} />
            <div className={styles.bundleRowInfo}>
              <div className={`${styles.skeleton} ${styles.bundleRowName}`} />
              <div className={`${styles.skeleton} ${styles.bundleRowDesc}`} />
              <div className={`${styles.skeleton} ${styles.bundleRowPrice}`} />
            </div>
          </div>
        ))}
      </div>
      <div className={`${styles.skeleton} ${styles.bundleFooter}`} />
    </div>
  );
}

function ComparisonTableSkeleton() {
  return (
    <div
      className={styles.tableContainer}
      aria-label="Loading comparison table"
    >
      <div className={`${styles.skeleton} ${styles.tableHeading}`} />
      <div className={styles.tableGrid}>
        <div className={styles.tableRow}>
          <div className={`${styles.skeleton} ${styles.tableLabel}`} />
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.tableProductCell}>
              <div className={`${styles.skeleton} ${styles.tableImage}`} />
              <div className={`${styles.skeleton} ${styles.tableName}`} />
            </div>
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={styles.tableRow}>
            <div className={`${styles.skeleton} ${styles.tableLabel}`} />
            {[0, 1, 2].map((col) => (
              <div
                key={col}
                className={`${styles.skeleton} ${styles.tableValue}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NextActionsBarSkeleton() {
  return (
    <div className={styles.actionsContainer} aria-label="Loading actions">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${styles.skeleton} ${styles.actionButton}`} />
      ))}
    </div>
  );
}

function ComparisonSummarySkeleton() {
  return (
    <div className={styles.summaryContainer} aria-label="Loading summary">
      <div className={styles.summaryHeader}>
        <div className={`${styles.skeleton} ${styles.summaryIcon}`} />
        <div className={`${styles.skeleton} ${styles.summaryLabel}`} />
      </div>
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLineShort}`} />
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className={styles.genericContainer} aria-label="Loading content">
      <div className={`${styles.skeleton} ${styles.carouselHeading}`} />
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLineShort}`} />
    </div>
  );
}

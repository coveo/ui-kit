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
    <div className={styles.container} aria-label="Loading product carousel">
      <div className={`${styles.skeleton} ${styles.carouselHeading}`} />
      <div className={styles.carouselTrack}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.carouselCard}>
            <div className={`${styles.skeleton} ${styles.carouselImage}`} />
            <div className={`${styles.skeleton} ${styles.carouselName}`} />
            <div className={`${styles.skeleton} ${styles.carouselPrice}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BundleDisplaySkeleton() {
  return (
    <div className={styles.container} aria-label="Loading bundle display">
      <div className={`${styles.skeleton} ${styles.bundleHeading}`} />
      <div className={styles.bundleTabs}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${styles.skeleton} ${styles.bundleTab}`} />
        ))}
      </div>
      <div className={styles.bundleSlots}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.bundleSlot}>
            <div className={`${styles.skeleton} ${styles.bundleSlotLabel}`} />
            <div className={`${styles.skeleton} ${styles.bundleSlotCard}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTableSkeleton() {
  return (
    <div className={styles.container} aria-label="Loading comparison table">
      <div className={`${styles.skeleton} ${styles.comparisonHeading}`} />
      <div className={styles.comparisonGrid}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.comparisonColumn}>
            <div className={`${styles.skeleton} ${styles.comparisonImage}`} />
            <div className={`${styles.skeleton} ${styles.comparisonAttr}`} />
            <div className={`${styles.skeleton} ${styles.comparisonAttr}`} />
            <div className={`${styles.skeleton} ${styles.comparisonAttr}`} />
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
    <div className={styles.container} aria-label="Loading summary">
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLineShort}`} />
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className={styles.container} aria-label="Loading content">
      <div className={`${styles.skeleton} ${styles.carouselHeading}`} />
      <div className={`${styles.skeleton} ${styles.summaryLine}`} />
      <div className={`${styles.skeleton} ${styles.summaryLineShort}`} />
    </div>
  );
}

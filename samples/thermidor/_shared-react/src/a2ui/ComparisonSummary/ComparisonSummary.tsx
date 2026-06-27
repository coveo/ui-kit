import styles from './ComparisonSummary.module.css';

interface A2UIComparisonSummaryProps {
  text: string;
}

export function A2UIComparisonSummary({text}: A2UIComparisonSummaryProps) {
  if (!text) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}

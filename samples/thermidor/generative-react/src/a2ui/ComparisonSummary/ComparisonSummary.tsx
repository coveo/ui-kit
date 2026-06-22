import styles from './ComparisonSummary.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIComparisonSummaryProps {
  surface: ParsedSurface;
}

export function A2UIComparisonSummary({surface}: A2UIComparisonSummaryProps) {
  const text =
    (surface.componentProps.text as {literalString?: string})?.literalString ??
    '';

  if (!text) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}

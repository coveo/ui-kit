import {useMemo} from 'react';
import {renderMarkdown} from '../../utils.js';
import styles from './ComparisonSummary.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIComparisonSummaryProps {
  surface: ParsedSurface;
}

interface ComparisonSummaryData {
  text?: {
    value?: string;
  };
}

export function A2UIComparisonSummary({surface}: A2UIComparisonSummaryProps) {
  const data = surface.data as ComparisonSummaryData;
  const text = data.text?.value ?? '';

  const html = useMemo(() => {
    if (!text) return '';
    return renderMarkdown(text);
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          ✦
        </span>
        <span className={styles.label}>AI Summary</span>
      </div>
      <div className={styles.text} dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
}

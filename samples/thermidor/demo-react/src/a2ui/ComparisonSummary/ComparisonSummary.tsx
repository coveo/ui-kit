import {useMemo} from 'react';
import {renderMarkdown} from '../../utils.js';
import styles from './ComparisonSummary.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIComparisonSummaryProps {
  surface: ParsedSurface;
}

export function A2UIComparisonSummary({surface}: A2UIComparisonSummaryProps) {
  const text = extractText(surface);

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

function extractText(surface: ParsedSurface): string {
  // Unified format: dataModel.text or dataModel.summary (string or {value})
  const dataText = surface.data.text as string | {value?: string} | undefined;
  if (typeof dataText === 'string') return dataText;
  if (dataText && typeof dataText === 'object' && 'value' in dataText) return dataText.value ?? '';
  const dataSummary = surface.data.summary as string | {value?: string} | undefined;
  if (typeof dataSummary === 'string') return dataSummary;
  if (dataSummary && typeof dataSummary === 'object' && 'value' in dataSummary)
    return dataSummary.value ?? '';
  // Legacy format
  return (surface.componentProps.text as {literalString?: string})?.literalString ?? '';
}

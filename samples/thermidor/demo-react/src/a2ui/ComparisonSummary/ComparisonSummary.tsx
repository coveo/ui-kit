import {useMemo} from 'react';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import styles from './ComparisonSummary.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UIComparisonSummaryProps {
  surface: ParsedSurface;
}

export function A2UIComparisonSummary({surface}: A2UIComparisonSummaryProps) {
  const text = (surface.componentProps.text as {literalString?: string})?.literalString ?? '';

  const html = useMemo(() => {
    if (!text) return '';
    try {
      const raw = marked.parse(text, {breaks: true, gfm: true}) as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return DOMPurify.sanitize(text);
    }
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

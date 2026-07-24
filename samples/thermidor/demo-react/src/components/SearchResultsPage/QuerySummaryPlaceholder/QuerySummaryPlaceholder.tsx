import {truncate} from '../utils.js';
import styles from './QuerySummaryPlaceholder.module.css';

interface QuerySummaryPlaceholderProps {
  query: string;
  totalCount: number;
  firstResult: number;
  pageSize: number;
  productCount: number;
}

export function QuerySummaryPlaceholder({
  query,
  totalCount,
  firstResult,
  productCount,
}: QuerySummaryPlaceholderProps) {
  if (totalCount === 0 && !query) {
    return null;
  }

  if (totalCount === 0 && query) {
    return (
      <p className={styles.summary}>
        No results for <strong>{truncate(query, 100)}</strong>
      </p>
    );
  }

  const firstIndex = firstResult + 1;
  const lastIndex = firstResult + productCount;

  return (
    <p className={styles.summary}>
      Products <strong>{firstIndex}</strong>-<strong>{lastIndex}</strong> of{' '}
      <strong>{totalCount.toLocaleString()}</strong>
      {query && (
        <>
          {' '}
          for <strong>{truncate(query, 100)}</strong>
        </>
      )}
    </p>
  );
}

import type {QuerySummaryProps} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './QuerySummary.module.css';

/**
 * A2-UI renderer for the `query-summary` component.
 *
 * Renders the current result window (e.g. "Products 1-12 of 43 for Water Sports"). It reads
 * its backend-computed aggregate directly from its resolved props (bound to the A2-UI data
 * model) rather than combining the state of the search-box, pagination, and product-list
 * components, so it has no cross-component coupling.
 *
 * - No results and no query: renders nothing.
 * - No results with a query: "No results for {query}".
 * - Otherwise: "Products {firstIndex}-{lastIndex} of {totalEntries}", with the trailing
 *   " for {query}" only when a query is present.
 */
export function QuerySummaryRenderer({props}: TypedRendererProps<QuerySummaryProps, never>) {
  const {query, firstIndex, lastIndex} = props;
  const totalEntries = props.totalEntries ?? 0;

  if (totalEntries === 0 && !query) {
    return null;
  }

  if (totalEntries === 0 && query) {
    return (
      <p className={styles.summary}>
        No results for <strong>{query}</strong>
      </p>
    );
  }

  return (
    <p className={styles.summary}>
      Products <strong>{firstIndex}</strong>-<strong>{lastIndex}</strong> of{' '}
      <strong>{totalEntries.toLocaleString()}</strong>
      {query && (
        <>
          {' '}
          for <strong>{query}</strong>
        </>
      )}
    </p>
  );
}

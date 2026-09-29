import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {QuerySummaryProps} from '@coveo/thermidor-schema';
import {QuerySummaryPropsSchema} from '@coveo/thermidor-schema';
import {toInferableBinderSchema} from '../catalog-props-migration.js';
import styles from './QuerySummary.module.css';

/**
 * A2-UI component for the `query-summary`.
 *
 * Renders the current result window (e.g. "Products 1-12 of 43 for Water Sports"). The generic
 * binder resolves the backend-computed aggregate (`query`, `firstIndex`, `lastIndex`,
 * `totalEntries`) directly from `QuerySummaryPropsSchema` (bound to the A2-UI data model) rather
 * than combining the state of the search-box, pagination, and product-list components, so it has
 * no cross-component coupling. Presentational — no actions.
 *
 * - No results and no query: renders nothing.
 * - No results with a query: "No results for {query}".
 * - Otherwise: "Products {firstIndex}-{lastIndex} of {totalEntries}", with the trailing
 *   " for {query}" only when a query is present.
 */
export const QuerySummary = createReactComponent(
  {
    name: 'QuerySummary',
    schema: toInferableBinderSchema<QuerySummaryProps>(QuerySummaryPropsSchema),
  },
  ({props}) => {
    const {query, firstIndex, lastIndex, totalEntries} = props;

    // Bindings resolve progressively: any of the four fields may still be
    // undefined on an early render. Treat a partially-resolved summary as
    // not-yet-loaded (render nothing) rather than showing "undefined-undefined"
    // or a premature "No results".
    if (totalEntries === undefined) {
      return null;
    }

    if (totalEntries === 0) {
      return query ? (
        <p className={styles.summary}>
          No results for <strong>{query}</strong>
        </p>
      ) : null;
    }

    if (firstIndex === undefined || lastIndex === undefined) {
      return null;
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
);

import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {QuerySummaryAction} from '@coveo/thermidor-schema';
import {QuerySummaryPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';
import styles from './QuerySummary.module.css';

/**
 * A2-UI component for the `query-summary`.
 *
 * Renders the current result window (e.g. "Products 1-12 of 43 for Water Sports"). The generic
 * binder resolves the backend-computed aggregate (`query`, `firstIndex`, `lastIndex`,
 * `totalEntries`, `correction`) directly from `QuerySummaryPropsSchema` (bound to the A2-UI data
 * model) rather than combining the state of the search-box, pagination, and product-list
 * components, so it has no cross-component coupling.
 *
 * - No results and no query: renders nothing.
 * - No results with a query: "No results for {query}".
 * - Otherwise: "Products {firstIndex}-{lastIndex} of {totalEntries}", with the trailing
 *   " for {query}" only when a query is present.
 * - When a correction or a query trigger replaced the shopper's query: "Showing results for
 *   {query}. Search instead for {originalQuery}", which dispatches `overrideCorrection`. A
 *   correction and a trigger read the same.
 */
export const QuerySummary = createReactComponent(
  {
    name: 'QuerySummary',
    schema: QuerySummaryPropsSchema,
  },
  ({props, context}) => {
    const {query, firstIndex, lastIndex, totalEntries, correction} = props;
    const startGesture = useGesture();

    // Bindings resolve progressively: any of the four fields may still be
    // undefined on an early render. Treat a partially-resolved summary as
    // not-yet-loaded (render nothing) rather than showing "undefined-undefined"
    // or a premature "No results".
    if (totalEntries === undefined) {
      return null;
    }

    const searchOriginalQuery = (originalQuery: string) => {
      const overrideCorrectionAction: QuerySummaryAction = {
        event: {name: 'overrideCorrection', context: {originalQuery}},
      };
      startGesture(
        () => {},
        () => context.dispatchAction(overrideCorrectionAction)
      );
    };

    const correctionNotice = correction && (
      <p className={styles.correction}>
        Showing results for <strong>{query}</strong>. Search instead for{' '}
        <button
          type="button"
          className={styles.originalQuery}
          onClick={() => searchOriginalQuery(correction.originalQuery)}
        >
          {correction.originalQuery}
        </button>
      </p>
    );

    if (totalEntries === 0) {
      return query ? (
        <div>
          {correctionNotice}
          <p className={styles.summary}>
            No results for <strong>{query}</strong>
          </p>
        </div>
      ) : null;
    }

    if (firstIndex === undefined || lastIndex === undefined) {
      return null;
    }

    return (
      <div>
        {correctionNotice}
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
      </div>
    );
  }
);

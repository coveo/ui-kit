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
 *
 * When the backend replaced the shopper's query, the notice names both queries. If it can search
 * the shopper's query instead (`canOverride`), the notice ends with "Search instead for
 * {originalQuery}", which dispatches `overrideCorrection`:
 * - with results, above the result window: "Showing results for {query}. Search instead for
 *   {originalQuery}", or "Showing results for {query} instead of {originalQuery}";
 * - without results, in place of "No results for {query}": "No results for {query}. Search
 *   instead for {originalQuery}", or "No results for {query}, searched instead of
 *   {originalQuery}".
 */
export const QuerySummary = createReactComponent(
  {
    name: 'QuerySummary',
    schema: QuerySummaryPropsSchema,
  },
  ({props, context}) => {
    const {query, firstIndex, lastIndex, totalEntries, correction} = props;
    const startGesture = useGesture();

    // Bindings resolve progressively: any field may still be undefined on an
    // early render. Treat a partially-resolved summary as not-yet-loaded (render
    // nothing) rather than showing "undefined-undefined" or a premature "No results".
    if (totalEntries === undefined) {
      return null;
    }

    const searchOriginalQuery = () => {
      const overrideCorrectionAction: QuerySummaryAction = {
        event: {name: 'overrideCorrection', context: {}},
      };
      startGesture(
        () => {},
        () => context.dispatchAction(overrideCorrectionAction)
      );
    };

    const replacedQuery = query && correction;
    const originalQueryLink = replacedQuery && correction.canOverride && (
      <>
        . Search instead for{' '}
        <button type="button" className={styles.originalQuery} onClick={searchOriginalQuery}>
          {correction.originalQuery}
        </button>
      </>
    );

    if (totalEntries === 0) {
      return query ? (
        <p className={styles.summary}>
          No results for <strong>{query}</strong>
          {replacedQuery &&
            (originalQueryLink || <>, searched instead of {correction.originalQuery}</>)}
        </p>
      ) : null;
    }

    const correctionNotice = replacedQuery && (
      <p className={styles.correction}>
        Showing results for <strong>{query}</strong>
        {originalQueryLink || <> instead of {correction.originalQuery}</>}
      </p>
    );

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

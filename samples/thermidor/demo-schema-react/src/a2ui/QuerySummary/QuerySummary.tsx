import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {useRef} from 'react';
import type {QueryCorrection, QuerySummaryAction} from '@coveo/thermidor-schema';
import {QuerySummaryPropsSchema} from '@coveo/thermidor-schema/zod3';
import {resultsFocusTarget} from '../results-focus.js';
import {useGesture} from '../session-request.js';
import {useRemovalFocus} from '../use-removal-focus.js';
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
 * When the backend replaced the shopper's query, a notice worded like the Atomic commerce
 * did-you-mean follows, ending with a "Search instead" link (`overrideCorrection`) if `canOverride`.
 * Once the search runs, keyboard focus moves from the link to the results.
 */
export const QuerySummary = createReactComponent(
  {
    name: 'QuerySummary',
    schema: QuerySummaryPropsSchema,
  },
  ({props, context}) => {
    const {query, firstIndex, lastIndex, totalEntries, correction} = props;
    const startGesture = useGesture();
    const summary = useRef<HTMLDivElement>(null);
    const keepFocusAfterOverriding = useRemovalFocus(summary, correction);

    // Bindings resolve progressively: any field may still be undefined on an
    // early render. Treat a partially-resolved summary as not-yet-loaded (render
    // nothing) rather than showing "undefined-undefined" or a premature "No results".
    if (totalEntries === undefined) {
      return null;
    }

    const searchOriginalQuery = () => {
      keepFocusAfterOverriding(0);
      const overrideCorrectionAction: QuerySummaryAction = {
        event: {name: 'overrideCorrection', context: {}},
      };
      startGesture(
        () => {},
        () => context.dispatchAction(overrideCorrectionAction)
      );
    };

    const correctionNotice = query && correction && (
      <CorrectionNotice
        query={query}
        correction={correction}
        onSearchOriginalQuery={searchOriginalQuery}
      />
    );

    if (totalEntries === 0) {
      return query ? (
        <div ref={summary} data-layout="fill">
          <p className={styles.summary} {...resultsFocusTarget}>
            <span>
              No results for <strong>{query}</strong>
            </span>
          </p>
          {correctionNotice}
        </div>
      ) : null;
    }

    if (firstIndex === undefined || lastIndex === undefined) {
      return null;
    }

    return (
      <div ref={summary} data-layout="fill">
        <p className={styles.summary}>
          <span>
            Products <strong>{firstIndex}</strong>-<strong>{lastIndex}</strong> of{' '}
            <strong>{totalEntries.toLocaleString()}</strong>
            {query && (
              <>
                {' '}
                for <strong>{query}</strong>
              </>
            )}
          </span>
        </p>
        {correctionNotice}
      </div>
    );
  }
);

function CorrectionNotice({
  query,
  correction,
  onSearchOriginalQuery,
}: {
  query: string;
  correction: QueryCorrection;
  onSearchOriginalQuery: () => void;
}) {
  return (
    <div className={styles.correction}>
      {correction.cause === 'trigger' ? (
        <p className={styles.replacement}>
          Showing products for <strong>{query}</strong>
        </p>
      ) : (
        <>
          <p>
            We couldn't find anything for <strong>{correction.originalQuery}</strong>
          </p>
          <p>
            Query was automatically corrected to <strong>{query}</strong>
          </p>
        </>
      )}
      {correction.canOverride && (
        <p>
          Search instead for{' '}
          <button type="button" className={styles.originalQuery} onClick={onSearchOriginalQuery}>
            {correction.originalQuery}
          </button>
        </p>
      )}
    </div>
  );
}

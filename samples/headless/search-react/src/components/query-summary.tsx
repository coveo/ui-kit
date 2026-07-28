import type {QuerySummary as QuerySummaryController} from '@coveo/headless';
import {useController} from '../use-controller';

interface QuerySummaryProps {
  controller: QuerySummaryController;
}

export function QuerySummary({controller}: QuerySummaryProps) {
  const {hasResults, firstResult, lastResult, total, hasQuery, query} = useController(controller);

  if (!hasResults) {
    return <p className="query-summary">No results</p>;
  }

  return (
    <p className="query-summary">
      Results <strong>{firstResult}</strong>-<strong>{lastResult}</strong> of{' '}
      <strong>{total.toLocaleString()}</strong>
      {hasQuery && (
        <>
          {' '}
          for <strong>{query}</strong>
        </>
      )}
    </p>
  );
}

import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface QuerySummaryGuardProps {
  hasResults: boolean;
  hasError: boolean;
  firstSearchExecuted: boolean;
}
export const QuerySummaryGuard: FunctionalComponent<QuerySummaryGuardProps> = (
  {hasResults, hasError, firstSearchExecuted},
  children
) => {
  if (hasError || (!hasResults && firstSearchExecuted)) {
    return;
  }

  if (!firstSearchExecuted) {
    return (
      <div
        part="placeholder"
        aria-hidden="true"
        class="bg-neutral my-2 h-6 w-60 animate-pulse rounded"
      ></div>
    );
  }

  return <Fragment>{children}</Fragment>;
};

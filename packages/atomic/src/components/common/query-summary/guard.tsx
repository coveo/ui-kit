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
        class="h-6 my-2 w-60 bg-neutral rounded animate-pulse"
      ></div>
    );
  }

  return <Fragment>{children}</Fragment>;
};

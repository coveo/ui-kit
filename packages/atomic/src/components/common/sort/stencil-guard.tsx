import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface SortGuardProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  hasResults: boolean;
}
export const SortGuard: FunctionalComponent<SortGuardProps> = (
  {hasError, firstSearchExecuted, hasResults},
  children
) => {
  if (hasError) {
    return;
  }

  if (!firstSearchExecuted) {
    return (
      <div
        part="placeholder"
        aria-hidden
        class="bg-neutral my-2 h-6 w-44 animate-pulse rounded"
      ></div>
    );
  }

  if (!hasResults) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

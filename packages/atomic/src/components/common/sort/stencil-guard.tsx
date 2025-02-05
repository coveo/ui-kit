import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {noChange} from 'lit-html';

interface SortGuardProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  hasResults: boolean;
}
export const SortGuard: FunctionalComponent<SortGuardProps> = (
  {hasError, firstSearchExecuted, hasResults},
  children
) => {
  if (hasError || !hasResults) {
    return noChange;
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

  return <Fragment>{children}</Fragment>;
};

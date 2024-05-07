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
        class="rounded h-6 my-2 w-44 bg-neutral animate-pulse"
      ></div>
    );
  }

  if (!hasResults) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

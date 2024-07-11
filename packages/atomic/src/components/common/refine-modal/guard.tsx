import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface RefineToggleGuardProps {
  hasError: boolean;
  firstRequestExecuted: boolean;
  hasItems: boolean;
}
export const RefineToggleGuard: FunctionalComponent<RefineToggleGuardProps> = (
  {hasError, firstRequestExecuted, hasItems},
  children
) => {
  if (hasError) {
    return;
  }

  if (!firstRequestExecuted) {
    return (
      <div
        part="placeholder"
        aria-hidden
        class="rounded w-28 h-8 my-2 bg-neutral animate-pulse"
      ></div>
    );
  }

  if (!hasItems) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

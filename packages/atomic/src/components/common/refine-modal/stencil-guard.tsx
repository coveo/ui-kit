import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface RefineToggleGuardProps {
  hasError: boolean;
  firstRequestExecuted: boolean;
  hasItems: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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
        class="bg-neutral my-2 h-8 w-28 animate-pulse rounded"
      ></div>
    );
  }

  if (!hasItems) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface LoadMoreGuardProps {
  isLoaded: boolean;
  hasResults: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const LoadMoreGuard: FunctionalComponent<LoadMoreGuardProps> = (
  {isLoaded, hasResults},
  children
) => {
  if (!isLoaded || !hasResults) {
    return;
  }
  return <Fragment>{children}</Fragment>;
};

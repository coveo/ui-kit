import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface NoItemsGuardProps {
  firstSearchExecuted: boolean;
  isLoading: boolean;
  hasResults: boolean;
}
export const NoItemsGuard: FunctionalComponent<NoItemsGuardProps> = (
  {firstSearchExecuted, isLoading, hasResults},
  children
) => {
  if (!firstSearchExecuted || isLoading || hasResults) {
    return;
  }
  return <Fragment>{children}</Fragment>;
};

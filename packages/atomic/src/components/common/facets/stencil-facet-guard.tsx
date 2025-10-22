import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {Hidden} from '../stencil-hidden';

interface FacetGuardProps {
  hasError: boolean;
  enabled: boolean;
  firstSearchExecuted: boolean;
  hasResults: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetGuard: FunctionalComponent<FacetGuardProps> = (
  {hasError, enabled, firstSearchExecuted, hasResults},
  children
) => {
  if (hasError || !enabled || (firstSearchExecuted && !hasResults)) {
    return <Hidden></Hidden>;
  }

  return <Fragment>{children}</Fragment>;
};

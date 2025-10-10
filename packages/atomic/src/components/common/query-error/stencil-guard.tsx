import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface QueryErrorGuardProps {
  hasError: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryErrorGuard: FunctionalComponent<QueryErrorGuardProps> = (
  {hasError},
  children
) => {
  if (!hasError) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

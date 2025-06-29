import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface QueryErrorGuardProps {
  hasError: boolean;
}

// Replace with the when directive
export const QueryErrorGuard: FunctionalComponent<QueryErrorGuardProps> = (
  {hasError},
  children
) => {
  if (!hasError) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};

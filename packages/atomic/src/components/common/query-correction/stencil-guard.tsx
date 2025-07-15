import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface QueryCorrectionGuardProps {
  hasCorrection: boolean;
}

// Just use a when directive for Lit. This is an unnecessary component in Lit's context.
export const QueryCorrectionGuard: FunctionalComponent<
  QueryCorrectionGuardProps
> = ({hasCorrection}, children) => {
  if (!hasCorrection) {
    return;
  }
  return <Fragment>{children}</Fragment>;
};

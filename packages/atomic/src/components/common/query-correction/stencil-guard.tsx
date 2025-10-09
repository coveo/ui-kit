import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface QueryCorrectionGuardProps {
  hasCorrection: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryCorrectionGuard: FunctionalComponent<
  QueryCorrectionGuardProps
> = ({hasCorrection}, children) => {
  if (!hasCorrection) {
    return;
  }
  return <Fragment>{children}</Fragment>;
};

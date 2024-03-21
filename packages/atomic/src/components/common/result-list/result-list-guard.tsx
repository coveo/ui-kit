import {FunctionalComponent, h, Fragment} from '@stencil/core';

export interface ResultListGuardProps {
  hasError: boolean;
  hasResults: boolean;
  hasTemplate: boolean;
  firstSearchExecuted: boolean;
}

export const ResultListGuard: FunctionalComponent<ResultListGuardProps> = (
  {hasError, hasResults, firstSearchExecuted, hasTemplate},
  children
) => {
  if (hasError || (firstSearchExecuted && !hasResults) || !hasTemplate) {
    return;
  }
  return <Fragment>{...children}</Fragment>;
};

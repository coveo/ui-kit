import {FunctionalComponent, h, Fragment} from '@stencil/core';
import {Hidden} from '../hidden';

export interface PagerGuardProps {
  hasError: boolean;
  isAppLoaded: boolean;
  hasResults: boolean;
}

export const PagerGuard: FunctionalComponent<PagerGuardProps> = (
  props,
  children
) => {
  if (props.hasError || !props.isAppLoaded || !props.hasResults) {
    return <Hidden />;
  }
  return <Fragment>{...children}</Fragment>;
};

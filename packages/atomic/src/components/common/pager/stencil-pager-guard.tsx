import {FunctionalComponent, h, Fragment} from '@stencil/core';
import {Hidden} from '../stencil-hidden';

/**
 * @deprecated use the lit equivalent
 */
export interface PagerGuardProps {
  hasError: boolean;
  isAppLoaded: boolean;
  hasItems: boolean;
}

/**
 * @deprecated use the lit equivalent
 */
export const PagerGuard: FunctionalComponent<PagerGuardProps> = (
  props,
  children
) => {
  if (props.hasError || !props.isAppLoaded || !props.hasItems) {
    return <Hidden />;
  }
  return <Fragment>{...children}</Fragment>;
};

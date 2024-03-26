import {FunctionalComponent, h, Fragment} from '@stencil/core';
import {ResultDisplayLayout} from '../layout/display-options';

export interface ItemDisplayGuardProps {
  firstRequestExecuted: boolean;
  hasItems: boolean;
  display: ResultDisplayLayout;
}

export const ItemDisplayGuard: FunctionalComponent<ItemDisplayGuardProps> = (
  props,
  children
) => {
  if (!props.hasItems || !props.firstRequestExecuted) {
    return;
  }

  return <Fragment>{...children}</Fragment>;
};

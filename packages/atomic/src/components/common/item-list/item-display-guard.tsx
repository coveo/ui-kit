import {FunctionalComponent, h, Fragment} from '@stencil/core';

export interface ItemDisplayGuardProps {
  firstRequestExecuted: boolean;
  hasItems: boolean;
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

import {FunctionalComponent, h, Fragment} from '@stencil/core';

interface ItemDisplayGuardProps {
  firstRequestExecuted: boolean;
  hasItems: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ItemDisplayGuard: FunctionalComponent<ItemDisplayGuardProps> = (
  props,
  children
) => {
  if (!props.hasItems || !props.firstRequestExecuted) {
    return;
  }

  return <Fragment>{...children}</Fragment>;
};

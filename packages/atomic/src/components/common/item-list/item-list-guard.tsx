import {FunctionalComponent, h, Fragment} from '@stencil/core';

export interface ItemListGuardProps {
  hasError: boolean;
  hasItems: boolean;
  hasTemplate: boolean;
  firstRequestExecuted: boolean;
  templateHasError: boolean;
}

export const ItemListGuard: FunctionalComponent<ItemListGuardProps> = (
  {hasError, hasItems, firstRequestExecuted, hasTemplate, templateHasError},
  children
) => {
  if (hasError || (firstRequestExecuted && !hasItems) || !hasTemplate) {
    return;
  }
  return (
    <Fragment>
      {templateHasError && <slot></slot>}
      {...children}
    </Fragment>
  );
};

import {FunctionalComponent, h, Fragment} from '@stencil/core';

interface ItemListGuardProps {
  hasError: boolean;
  hasItems: boolean;
  hasTemplate: boolean;
  firstRequestExecuted: boolean;
  templateHasError: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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

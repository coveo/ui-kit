import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const NoItemsContainer: FunctionalComponent = (_, children) => [
  <div class="text-on-background flex h-full w-full flex-col items-center">
    {children}
  </div>,
  <slot></slot>,
];

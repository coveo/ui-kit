import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const SortContainer: FunctionalComponent = (_, children) => {
  return (
    <div class="text-on-background flex flex-wrap items-center">{children}</div>
  );
};

import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const LoadMoreContainer: FunctionalComponent = (_, children) => {
  return (
    <div class="flex flex-col items-center" part="container">
      {children}
    </div>
  );
};

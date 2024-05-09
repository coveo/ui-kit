import {FunctionalComponent, h} from '@stencil/core';

export const SortContainer: FunctionalComponent = (_, children) => {
  return (
    <div class="flex items-center flex-wrap text-on-background">{children}</div>
  );
};

import {FunctionalComponent, h} from '@stencil/core';

export const SortContainer: FunctionalComponent = (_, children) => {
  return (
    <div class="text-on-background flex flex-wrap items-center">{children}</div>
  );
};

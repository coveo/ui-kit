import {FunctionalComponent, h} from '@stencil/core';

export const LoadMoreContainer: FunctionalComponent = (_, children) => {
  return (
    <div class="flex flex-col items-center" part="container">
      {children}
    </div>
  );
};

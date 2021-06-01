import {FunctionalComponent, h} from '@stencil/core';

export const FacetWrapper: FunctionalComponent = (_, children) => (
  <div class="border border-neutral rounded-lg p-6" part="facet">
    {children}
  </div>
);

import {FunctionalComponent, h} from '@stencil/core';

export const FacetContainer: FunctionalComponent = (_, children) => (
  <div class="bg-background border-neutral rounded-lg border p-4" part="facet">
    {children}
  </div>
);

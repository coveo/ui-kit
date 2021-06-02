import {FunctionalComponent, h} from '@stencil/core';

export const FacetContainer: FunctionalComponent = (_, children) => (
  <div class="bg-background border border-neutral rounded-lg p-6" part="facet">
    {children}
  </div>
);
